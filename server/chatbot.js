import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  return router;
}
