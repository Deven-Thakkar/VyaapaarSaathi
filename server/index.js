import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

import { createChatbotRouter } from "./chatbot.js";
import { createInvoiceRouter } from "./invoice.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount chatbot routes under /api
app.use("/api", createChatbotRouter());

// Mount invoice routes under /api
app.use("/api", createInvoiceRouter());

// ✅ ML Prediction Route (raw passthrough - used by chatbot internally)
app.post('/api/predict', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/predict', req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to reach ML service' });
    }
  }
});

// ✅ Smart Insights - fetches REAL Supabase data, then calls ML API
app.post('/api/smart-insights', async (req, res) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { business_id } = req.body;
  let sales = 0, expenses = 0, inventory_value = 0, udhaar_given = 0;
  let businessData = null;

  try {
    if (business_id) {
      // 1. Business profile
      const { data: biz } = await supabase
        .from('businesses')
        .select('monthly_revenue, cost_stock, cost_salaries, cost_rent, cost_utilities')
        .eq('id', business_id)
        .single();
      businessData = biz;

      // 2. Transactions: sum income and expense this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: txns } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('business_id', business_id)
        .gte('transaction_date', startOfMonth.toISOString());

      if (txns && txns.length > 0) {
        sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      }

      // 3. Udhaar outstanding (pending records)
      const { data: udhaarData } = await supabase
        .from('udhaar_records')
        .select('amount_remaining')
        .eq('business_id', business_id)
        .eq('status', 'pending');

      if (udhaarData && udhaarData.length > 0) {
        udhaar_given = udhaarData.reduce((s, u) => s + Number(u.amount_remaining), 0);
      }

      // 4. Inventory value (stock * price)
      const { data: products } = await supabase
        .from('products')
        .select('stock, price')
        .eq('business_id', business_id);

      if (products && products.length > 0) {
        inventory_value = products.reduce((s, p) => s + (Number(p.stock) * Number(p.price)), 0);
      }
    }

    // Fallback to demo data if no real data found
    const useMock = !business_id || (sales === 0 && expenses === 0 && udhaar_given === 0);
    const fixedCosts = businessData
      ? Number(businessData.cost_stock || 0) + Number(businessData.cost_salaries || 0) + Number(businessData.cost_rent || 0) + Number(businessData.cost_utilities || 0)
      : 0;

    const payload = useMock ? {
      sales: 12450,
      expenses: 8000,
      cash_balance: 50000,
      udhaar_given: 23300,
      udhaar_collected: 0,
      inventory_value: 150000
    } : {
      sales,
      expenses: expenses || fixedCosts,
      cash_balance: Math.max(0, sales - expenses),
      udhaar_given,
      udhaar_collected: 0,
      inventory_value
    };

    // Call Python ML API
    let mlResult;
    try {
      const mlResponse = await axios.post('http://localhost:8000/predict', payload, { timeout: 5000 });
      mlResult = mlResponse.data;
    } catch (mlErr) {
      // ML unavailable: inline rule-based fallback (never returns 500 to frontend)
      const expense_ratio = payload.expenses / (payload.sales + 1);
      const udhaar_ratio = payload.udhaar_given / (payload.sales + 1);
      mlResult = {
        cashflow_prediction: (payload.sales * 0.95) - (payload.expenses * 0.08) + (payload.inventory_value * 0.01),
        risk_prediction: Math.min(1.0, expense_ratio * 0.6 + udhaar_ratio * 0.4),
        source: 'node_rule_fallback'
      };
    }

    res.json({
      ...mlResult,
      meta: {
        sales,
        expenses,
        udhaar_given,
        inventory_value,
        is_demo: useMock
      }
    });
  } catch (err) {
    console.error('Smart insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Root health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "VyaaparSaathi API server running" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});

// Handle port-in-use and other listen errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Kill the other process or change PORT in .env`);
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});