import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from "twilio";

/**
 * Creates and returns an Express Router with all chatbot-related routes.
 * Expects environment variables: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY
 */
export function createChatbotRouter() {
  const router = Router();

  // ─── Supabase ───
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  // ─── Gemini Setup ───
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // ─── AI helpers ───
  async function generateGeminiResponse(prompt) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Gemini ERROR:", err);
      return null;
    }
  }

  async function generateAIResponse(prompt) {
    // 1. Try Ollama (local, fast)
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: prompt,
          stream: false,
        }),
      });

      const data = await response.json();

      if (data.response) {
        let reply = data.response.trim();
        reply = reply.replace(/\n+/g, " ");
        reply = reply.replace(/ +/g, " ");
        return reply;
      }
    } catch (err) {
      console.log("Ollama failed → switching to Gemini");
    }

    // 2. Fallback → Gemini
    const geminiReply = await generateGeminiResponse(prompt);
    if (geminiReply) return geminiReply;

    return "AI temporarily unavailable";
  }

  // ─── Routes ───

  // Health check
  router.get("/health", (req, res) => {
    res.json({ status: "ok", service: "chatbot" });
  });

  // POST /chat
  router.post("/chat", async (req, res) => {
    try {
      const { message, business_id } = req.body;
      const lowerMsg = message.toLowerCase();

      // 0. ML PREDICTION
      if (
        lowerMsg.includes("predict") || 
        lowerMsg.includes("future") || 
        lowerMsg.includes("risk") || 
        lowerMsg.includes("cashflow") || 
        lowerMsg.includes("run out of money")
      ) {
        // Fallback to mock data if real aggregated DB data isn't ready
        const payload = {
          sales: 12450,
          expenses: 8000,
          cash_balance: 50000,
          udhaar_given: 23300,
          udhaar_collected: 5000,
          inventory_value: 150000
        };

        try {
          const mlResponse = await fetch("http://localhost:5000/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          
          if (!mlResponse.ok) throw new Error("ML service failed");
          const mlData = await mlResponse.json();
          
          let insight = "✅ Business looks stable";
          if (mlData.cashflow_prediction < payload.expenses) {
            insight = "⚠️ You may face a cash shortage soon";
          } else if (mlData.risk_prediction > 0.5) {
            insight = "🚨 High risk detected. Reduce expenses or collect payments";
          }

          const aiReply = await generateAIResponse(`
You are a financial assistant for Indian shopkeepers.

STRICT RULES:
- Use clean Hinglish (no broken words)
- Keep it short (2 lines max)
- Be natural and professional

Data:
Cashflow Prediction: ₹${Math.round(mlData.cashflow_prediction)}
Risk: ${mlData.risk_prediction > 0.5 ? 'High' : 'Low'}
System Insight: ${insight}

Format this in a human way based on the System Insight.
Example: "📊 Aapka predicted cashflow kal ke liye ₹5200 hai. ⚠️ Risk level thoda high hai, kripya pending udhaar collect karein."

User question:
${message}

Final answer:
`);
          return res.json({ reply: aiReply });
        } catch (e) {
          console.error("ML Prediction Error:", e);
          return res.json({ reply: "Sorry, prediction service is temporarily unavailable." });
        }
      }

      // 1. TOTAL UDHAAR
      if (lowerMsg.includes("udhaar")) {
        const { data, error } = await supabase
          .from("udhaar_records")
          .select("amount_remaining")
          .eq("business_id", business_id);

        if (error) throw error;

        const total = data.reduce(
          (sum, item) => sum + Number(item.amount_remaining),
          0
        );

        const aiReply = await generateAIResponse(`
You are a financial assistant for Indian shopkeepers.

STRICT RULES:
- Use clean Hinglish (no broken words)
- Keep it short (1 line)
- Be natural and professional

Example:
"Aapka total udhaar ₹4500 pending hai."

User data:
Total udhaar = ₹${total}

User question:
${message}

Final answer:
`);

        return res.json({ reply: aiReply });
      }

      // 2. FOLLOW-UP
      if (lowerMsg.includes("follow")) {
        const { data, error } = await supabase
          .from("customers")
          .select("name, total_outstanding")
          .eq("business_id", business_id)
          .order("total_outstanding", { ascending: false })
          .limit(3);

        if (error) throw error;

        let customerList = "";
        data.forEach((c) => {
          customerList += `${c.name} - ₹${c.total_outstanding}, `;
        });

        const aiReply = await generateAIResponse(`
You are helping a shopkeeper manage payments.

STRICT RULES:
- Clean Hinglish
- Short and practical
- No weird words

Example:
"Sabse pehle Sharma ji se follow up karo, unka ₹3000 pending hai."

Customers:
${customerList}

User question:
${message}

Final answer:
`);

        return res.json({ reply: aiReply });
      }

      // 3. DEFAULT
      const aiReply = await generateAIResponse(`
You are a helpful assistant for Indian business owners.

STRICT RULES:
- Clean Hinglish
- Simple language
- Short reply

User said:
${message}

Final answer:
`);

      return res.json({ reply: aiReply });
    } catch (err) {
      console.error("CHAT ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /add-customer
  router.post("/add-customer", async (req, res) => {
    try {
      const { name, business_id } = req.body;

      const { data, error } = await supabase
        .from("customers")
        .insert([{ name, business_id }])
        .select();

      if (error) throw error;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /add-udhaar
  router.post("/add-udhaar", async (req, res) => {
    try {
      const { customer_id, business_id, amount } = req.body;

      const { data, error } = await supabase
        .from("udhaar_records")
        .insert([
          {
            customer_id,
            business_id,
            amount_remaining: amount,
          },
        ])
        .select();

      if (error) throw error;

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /send-whatsapp-summary
  router.post("/send-whatsapp-summary", async (req, res) => {
    try {
      const { type, business_id } = req.body;
      
      // 1. Fetch User Phone (fallback to test number)
      let userPhone = process.env.TEST_USER_PHONE;
      try {
        const { data: userData, error: userError } = await supabase
          .from("businesses") // Assumed table, fallback gracefully
          .select("phone")
          .eq("id", business_id)
          .single();
          
        if (!userError && userData && userData.phone) {
          userPhone = userData.phone.startsWith("whatsapp:") ? userData.phone : `whatsapp:${userData.phone}`;
        }
      } catch (e) {
        console.log("Could not fetch user phone, using fallback.");
      }

      // 2. Fetch/Derive Data
      let salesTotal = 0;
      let expensesTotal = 0;
      let udhaarTotal = 0;

      // Udhaar
      try {
        const { data: udhaarData, error: udhaarError } = await supabase
          .from("udhaar_records")
          .select("amount_remaining")
          .eq("business_id", business_id);

        if (!udhaarError && udhaarData) {
          udhaarTotal = udhaarData.reduce((sum, item) => sum + Number(item.amount_remaining), 0);
        } else {
          udhaarTotal = 23300; // Mock fallback
        }
      } catch (e) {
        udhaarTotal = 23300;
      }

      // Sales & Expenses (Mocking if tables don't exist as per fallback requirement)
      if (type === "daily") {
        salesTotal = 12450;
        expensesTotal = 8000;
      } else if (type === "weekly") {
        salesTotal = 85000;
        expensesTotal = 56000;
      } else if (type === "monthly") {
        salesTotal = 320000;
        expensesTotal = 210000;
      }

      // 3. Strict AI Prompt
      const prompt = `You are a financial assistant for small Indian businesses.

Data:
Sales: ₹${salesTotal}
Expenses: ₹${expensesTotal}
Udhaar: ₹${udhaarTotal}

Generate:
- Hinglish
- 2–3 lines max
- Include 1 actionable suggestion
- Friendly tone

Example:
"Aaj ₹12,000 ki bikri hui 👍 par ₹8,000 kharcha gaya. Udhaar ₹23,000 pending hai. Sharma ji ko follow up karo."

Generate the insight now:`;

      const aiReply = await generateAIResponse(prompt);

      // 4. Send WhatsApp Message
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: aiReply,
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: userPhone
        });
      } catch (twilioErr) {
        console.log("Twilio failed:", twilioErr.message);
        return res.json({
          success: false,
          message: "Pehle WhatsApp par message bhejo to activate service"
        });
      }

      res.json({ success: true, reply: aiReply });

    } catch (err) {
      console.error("WHATSAPP SUMMARY ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /bolna-call
  router.post("/bolna-call", async (req, res) => {
    try {
      const { business_id } = req.body;
      let phone_number = process.env.TEST_USER_PHONE;

      // Try to fetch real user phone from DB
      if (business_id) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("businesses")
            .select("phone")
            .eq("id", business_id)
            .single();
            
          if (!userError && userData && userData.phone) {
            phone_number = userData.phone;
          }
        } catch (e) {
          console.log("Could not fetch user phone, using fallback.");
        }
      }

      // Ensure phone format is correct for Bolna (usually requires country code, e.g., +91...)
      // Strip 'whatsapp:' if it was carried over from Twilio config
      if (phone_number && phone_number.startsWith("whatsapp:")) {
        phone_number = phone_number.replace("whatsapp:", "");
      }

      if (!phone_number) {
        return res.status(400).json({ error: "Phone number is required." });
      }

      const response = await fetch("https://api.bolna.ai/call", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BOLNA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: process.env.BOLNA_AGENT_ID,
          recipient_phone_number: phone_number,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate Bolna call");
      }

      res.json(data);
    } catch (err) {
      console.error("Bolna API error:", err.message);
      res.status(500).json({ error: "Failed to initiate call.", details: err.message });
    }
  });

  return router;
}
