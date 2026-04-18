import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

import { createChatbotRouter } from "./chatbot.js";
import { createInvoiceRouter } from "./invoice.js";

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", createChatbotRouter());
app.use("/api", createInvoiceRouter());

// ─── Helper: generate insight text from predictions + raw data ───
function generateInsights(cashflow, risk, sales, expenses, overdue_udhaar, inventory_value) {
  const insights = [];

  if (cashflow < expenses) {
    insights.push({ level: "warning", text: "Cash shortage likely. Reduce expenses or collect udhaar urgently." });
  }
  if (overdue_udhaar > sales * 0.3) {
    insights.push({ level: "warning", text: "Large overdue payments outstanding. Follow up immediately." });
  }
  if (inventory_value < sales * 0.5 && sales > 0) {
    insights.push({ level: "info", text: "Inventory running low relative to sales. Restock soon to avoid stockout." });
  }
  if (risk > 0.6) {
    insights.push({ level: "danger", text: "High business risk detected. Reduce fixed costs or increase collections." });
  }
  if (insights.length === 0) {
    insights.push({ level: "success", text: "Business is stable. Keep monitoring your udhaar recovery rate." });
  }

  return insights;
}

// ─── Helper: rule-based fallback when Python ML unavailable ───
function ruleBased(payload) {
  const { sales, expenses, udhaar_given, inventory_value } = payload;
  const expense_ratio = expenses / (sales + 1);
  const udhaar_ratio = udhaar_given / (sales + 1);
  return {
    cashflow_prediction: (sales * 0.95) - (expenses * 0.08) + (inventory_value * 0.01),
    risk_prediction: Math.min(1.0, expense_ratio * 0.6 + udhaar_ratio * 0.4),
    source: "rule_based_fallback"
  };
}

// ─── POST /api/predict — fully data-driven ───
app.post("/api/predict", async (req, res) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { business_id } = req.body;

  let sales = 0, expenses = 0, inventory_value = 0;
  let udhaar_given = 0, overdue_udhaar = 0;
  let fixedCosts = 0;

  try {
    if (business_id) {
      // 1. Business profile — fixed costs
      const { data: biz } = await supabase
        .from("businesses")
        .select("monthly_revenue, cost_stock, cost_salaries, cost_rent, cost_utilities")
        .eq("id", business_id)
        .single();

      if (biz) {
        fixedCosts = Number(biz.cost_stock || 0) + Number(biz.cost_salaries || 0)
          + Number(biz.cost_rent || 0) + Number(biz.cost_utilities || 0);
      }

      // 2. Transactions — current month income and expense
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: txns } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("business_id", business_id)
        .gte("transaction_date", startOfMonth.toISOString());

      if (txns && txns.length > 0) {
        sales = txns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
        expenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      }

      // 3. Udhaar — total pending and overdue
      const today = new Date().toISOString();
      const { data: udhaarData } = await supabase
        .from("udhaar_records")
        .select("amount_remaining, due_date")
        .eq("business_id", business_id)
        .eq("status", "pending");

      if (udhaarData && udhaarData.length > 0) {
        udhaar_given = udhaarData.reduce((s, u) => s + Number(u.amount_remaining), 0);
        overdue_udhaar = udhaarData
          .filter(u => u.due_date && u.due_date < today)
          .reduce((s, u) => s + Number(u.amount_remaining), 0);
      }

      // 4. Inventory value — SUM(stock * price)
      const { data: products } = await supabase
        .from("products")
        .select("stock, price")
        .eq("business_id", business_id);

      if (products && products.length > 0) {
        inventory_value = products.reduce((s, p) => s + (Number(p.stock) * Number(p.price)), 0);
      }
    }

    // Build feature payload (all real, no mocks)
    const payload = {
      sales:             sales,
      expenses:          expenses > 0 ? expenses : fixedCosts,
      cash_balance:      Math.max(0, sales - expenses),
      udhaar_given:      udhaar_given,
      udhaar_collected:  0,
      inventory_value:   inventory_value
    };

    // Ensure no nulls
    Object.keys(payload).forEach(k => { if (!payload[k] || isNaN(payload[k])) payload[k] = 0; });

    // Call Python ML API
    let mlResult;
    try {
      const mlResponse = await axios.post("http://localhost:8000/predict", payload, { timeout: 5000 });
      mlResult = mlResponse.data;
    } catch (_) {
      mlResult = ruleBased(payload);
    }

    // Generate human insights
    const insights = generateInsights(
      mlResult.cashflow_prediction,
      mlResult.risk_prediction,
      sales,
      payload.expenses,
      overdue_udhaar,
      inventory_value
    );

    res.json({
      cashflow_prediction: mlResult.cashflow_prediction,
      risk_prediction:     mlResult.risk_prediction,
      source:              mlResult.source || "ml_model",
      insights,
      meta: {
        sales,
        expenses:        payload.expenses,
        udhaar_given,
        overdue_udhaar,
        inventory_value,
        has_data:        sales > 0 || expenses > 0 || udhaar_given > 0
      }
    });

  } catch (err) {
    console.error("Predict error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Barcode Lookup API Proxy
app.get("/api/barcode-lookup", async (req, res) => {
  const { barcode } = req.query;
  
  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  try {
    const apiKey = process.env.BARCODE_LOOKUP_API_KEY || "4k2m9qob1m0cogop0ezmtr4gho81j4";
    const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${apiKey}`;
    
    console.log(`🔍 Looking up barcode: ${barcode}`);
    
    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    if (response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      console.log(`✅ Found product: ${product.title}`);
      res.json({
        success: true,
        barcode: barcode,
        productName: product.title || product.product_name || "Unknown Product",
        description: product.description || null,
        image: product.images?.[0] || null,
        price: product.lowest_recorded_price || product.price || null,
      });
    } else {
      console.log(`❌ No product found for barcode: ${barcode}`);
      res.status(404).json({ 
        success: false, 
        error: "Product not found in barcode database",
        barcode: barcode 
      });
    }
  } catch (err) {
    console.error("❌ Barcode Lookup API error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Barcode Lookup API failed", 
      details: err.message 
    });
  }
});

// Root health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "VyaaparSaathi API server running" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[OK] API server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[ERR] Port ${PORT} is already in use.`);
  } else {
    console.error("[ERR] Server error:", err);
  }
  process.exit(1);
});