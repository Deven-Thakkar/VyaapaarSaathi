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

      // 0. ML PREDICTION / BUSINESS KAISA CHAL RAHA HAI
      if (
        lowerMsg.includes("predict") || 
        lowerMsg.includes("future") || 
        lowerMsg.includes("risk") || 
        lowerMsg.includes("cashflow") || 
        lowerMsg.includes("run out of money") ||
        lowerMsg.includes("kaisa chal raha") ||
        lowerMsg.includes("business")
      ) {
        try {
          const mlResponse = await fetch("http://localhost:5000/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ business_id })
          });
          
          if (!mlResponse.ok) throw new Error("ML service failed");
          const mlData = await mlResponse.json();
          
          if (!mlData.meta.has_data) {
             return res.json({ reply: "No data available yet" });
          }

          let insight = "✅ Business looks stable";
          if (mlData.cashflow_prediction < mlData.meta.expenses) {
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
Sales: ₹${mlData.meta.sales}
Expenses: ₹${mlData.meta.expenses}
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

      // 2.5 INVENTORY / STOCK
      if (lowerMsg.includes("stock") || lowerMsg.includes("inventory") || lowerMsg.includes("items") || lowerMsg.includes("product") || lowerMsg.includes("bache") || lowerMsg.includes("bacha")) {
        try {
          const insightsRes = await fetch("http://localhost:5000/api/insights-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ business_id })
          });
          
          if (!insightsRes.ok) throw new Error("Insights API failed");
          const insightsData = await insightsRes.json();
          
          if (!insightsData.summary.has_data) {
             return res.json({ reply: "Inventory details not available yet." });
          }

          const totalStock = insightsData.top_products.reduce((sum, p) => sum + p.units, 0);
          
          const aiReply = await generateAIResponse(`
You are a helpful assistant for Indian business owners managing their inventory.

STRICT RULES:
- Clean Hinglish (no broken words)
- Keep it short (2 lines max)
- Be accurate based on the Data provided

Data:
Total Stock Units: ${totalStock}

User question:
${message}

Final answer:
`);
          return res.json({ reply: aiReply });
        } catch (e) {
          console.error("Inventory Fetch Error:", e);
        }
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

      // 2. Fetch Real Data via Predict API
      let mlData = null;
      try {
        const mlRes = await fetch("http://localhost:5000/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_id })
        });
        if (mlRes.ok) mlData = await mlRes.json();
      } catch (e) {
        console.error("Failed to fetch ML data for WhatsApp:", e);
      }

      if (!mlData || !mlData.meta.has_data) {
        return res.json({ success: true, reply: "No data available yet" });
      }

      const salesTotal = mlData.meta.sales;
      const expensesTotal = mlData.meta.expenses;
      const udhaarTotal = mlData.meta.udhaar_given;

      // 3. Strict AI Prompt
      const prompt = `You are a financial assistant for small Indian businesses.

Data:
Sales: ₹${salesTotal}
Expenses: ₹${expensesTotal}
Cashflow: ₹${salesTotal - expensesTotal}
Udhaar Pending: ₹${udhaarTotal}

Generate:
- Hinglish
- 2–3 lines max
- Include 1 actionable insight based on the data
- Friendly tone

Example:
"📊 Aaj ka sales ₹5000 hai, expenses ₹3000. ⚠️ ₹8000 udhaar pending hai — follow up karein."

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
