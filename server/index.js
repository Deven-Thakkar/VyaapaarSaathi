import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import PDFDocument from "pdfkit";
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

const USE_MOCK_DATA = false;
let cachedMockData = null;

// ─── Helper: Generate Realistic Mock Demo Data ───
function generateMockBusinessData() {
  const today = new Date();
  const transactions = [];
  
  // 1. Transactions (last 180 days for full charts)
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Add some random growth trend over 6 months
    const trend = 1 + ((180 - i) / 180) * 0.4; // up to 40% growth
    
    // Daily income: ₹3000 – ₹8000 (scaled by trend)
    const dailyIncome = Math.floor((3000 + Math.random() * 5000) * trend);
    // Daily expense: ₹1500 – ₹5000
    const dailyExpense = Math.floor((1500 + Math.random() * 3500) * trend);
    
    transactions.push({
      type: "income",
      amount: dailyIncome,
      transaction_date: d.toISOString(),
      category: "Sales",
      description: "Mock Sales"
    });
    
    transactions.push({
      type: "expense",
      amount: dailyExpense,
      transaction_date: d.toISOString(),
      category: "Operating Expense",
      description: "Mock Expense"
    });
  }

  // 2. Udhaar (3-5 customers)
  const udhaar_given = Math.floor(15000 + Math.random() * 25000); // Total pending
  const overdue_udhaar = Math.floor(udhaar_given * (0.1 + Math.random() * 0.3)); // 10-40% overdue

  // 3. Products
  const products = [
    { name: "Premium Basmati Rice 5kg", stock: Math.floor(20 + Math.random() * 50), price: 650 },
    { name: "Sunflower Oil 1L", stock: Math.floor(40 + Math.random() * 60), price: 145 },
    { name: "Aashirvaad Atta 10kg", stock: Math.floor(15 + Math.random() * 30), price: 420 },
    { name: "Tata Salt 1kg", stock: Math.floor(80 + Math.random() * 100), price: 25 },
    { name: "Maggi Noodles Pack", stock: Math.floor(100 + Math.random() * 150), price: 140 },
  ];
  
  const inventory_value = products.reduce((acc, p) => acc + (p.stock * p.price), 0);

  cachedMockData = {
    transactions,
    udhaar_given,
    overdue_udhaar,
    products,
    inventory_value
  };

  return cachedMockData;
}

// ─── POST /api/insights-data — time-series + top products from DB ───
app.post("/api/insights-data", async (req, res) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { business_id } = req.body;

  try {
    let txns = [];
    let productsList = [];
    let is_synthetic = USE_MOCK_DATA;

    if (USE_MOCK_DATA) {
      const mockData = cachedMockData || generateMockBusinessData();
      txns = mockData.transactions;
      productsList = mockData.products;
    } else {
      const since90 = new Date();
      since90.setDate(since90.getDate() - 90);

      const { data: rawSales, error: saleErr } = await supabase
        .from("sales")
        .select("total_amount, Date")
        .eq("business_id", business_id)
        .gte("Date", since90.toISOString().split("T")[0])
        .order("Date", { ascending: true });

      if (saleErr) throw saleErr;
      txns = rawSales || [];

      const { data: prods } = await supabase.from("products").select("name, stock, price").eq("business_id", business_id).order("stock", { ascending: false }).limit(5);
      productsList = prods || [];
    }

    // ── 1. Daily cashflow (last 30 days) ──
    const dailyMap = {};
    const cutoff30 = new Date();
    cutoff30.setDate(cutoff30.getDate() - 30);

    txns.forEach(t => {
      const dateStr = t.Date || t.transaction_date?.slice(0, 10);
      if (!dateStr) return;
      if (new Date(dateStr) < cutoff30) return;
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { income: 0, expense: 0 };
      dailyMap[dateStr].income += Number(t.total_amount || t.amount || 0);
    });

    const daily_cashflow = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        d: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        income: vals.income,
        expense: vals.expense,
        net: vals.income - vals.expense
      }));

    // ── 2. Monthly revenue (last 6 months) ──
    const monthlyMap = {};
    const cutoff6m = new Date();
    cutoff6m.setMonth(cutoff6m.getMonth() - 6);

    txns.forEach(t => {
      const dateStr = t.Date || t.transaction_date;
      if (!dateStr) return;
      if (new Date(dateStr) < cutoff6m) return;
      const key = dateStr.slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      monthlyMap[key].income += Number(t.total_amount || t.amount || 0);
    });

    const monthly_revenue = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        m: new Date(key + "-01").toLocaleDateString("en-IN", { month: "short" }),
        v: vals.income,
        expense: vals.expense,
        profit: vals.income - vals.expense
      }));

    const top_products = productsList.map(p => ({
      name: p.name,
      units: Number(p.stock),
      value: Number(p.stock) * Number(p.price)
    }));

    const totalSales = txns.filter(t => t.type === "income" && new Date(t.transaction_date) >= cutoff30).reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = txns.filter(t => t.type === "expense" && new Date(t.transaction_date) >= cutoff30).reduce((s, t) => s + Number(t.amount), 0);

    res.json({
      daily_cashflow,
      monthly_revenue,
      top_products,
      summary: {
        sales_30d: totalSales,
        expenses_30d: totalExpenses,
        net_30d: totalSales - totalExpenses,
        has_data: txns.length > 0,
        is_synthetic
      }
    });

  } catch (err) {
    console.error("insights-data error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── Helper: generate insight text from predictions + raw data ───
function generateInsights(cashflow, risk, sales, expenses, overdue_udhaar, inventory_value, is_synthetic) {
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
  
  if (sales > expenses * 1.2) {
      insights.push({ level: "success", text: "📈 Sales are improving steadily. Great job!" });
  } else if (expenses > sales * 1.1) {
      insights.push({ level: "warning", text: "⚠️ Expenses increasing — monitor closely." });
  }

  if (insights.filter(i => i.level !== "info").length === 0) {
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
  let is_synthetic = USE_MOCK_DATA;

  try {
    if (USE_MOCK_DATA) {
      const mockData = cachedMockData || generateMockBusinessData();
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const currentMonthTxns = mockData.transactions.filter(t => new Date(t.transaction_date) >= startOfMonth);
      sales = currentMonthTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      expenses = currentMonthTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      
      udhaar_given = mockData.udhaar_given;
      overdue_udhaar = mockData.overdue_udhaar;
      inventory_value = mockData.inventory_value;
    } else if (business_id) {
      const { data: biz } = await supabase.from("businesses").select("monthly_revenue, cost_stock, cost_salaries, cost_rent, cost_utilities").eq("id", business_id).single();

      if (biz) {
        fixedCosts = Number(biz.cost_stock || 0) + Number(biz.cost_salaries || 0) + Number(biz.cost_rent || 0) + Number(biz.cost_utilities || 0);
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: rawSales } = await supabase.from("sales").select("total_amount, Date").eq("business_id", business_id);

      const currentMonthSales = (rawSales || []).filter(t => new Date(t.Date || t.transaction_date) >= startOfMonth);

      if (currentMonthSales && currentMonthSales.length > 0) {
        sales = currentMonthSales.reduce((s, t) => s + Number(t.total_amount || t.amount), 0);
        // Assuming all transactions are income, and expenses are fixedCosts, 
        // since VoiceEntryPage inserts into sales table directly and doesn't record expenses.
        expenses = fixedCosts;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: udhaarData } = await supabase.from("udhaar_records").select("amount_remaining, due_date").eq("business_id", business_id).eq("status", "pending");

      if (udhaarData && udhaarData.length > 0) {
        udhaar_given = udhaarData.reduce((s, u) => s + Number(u.amount_remaining), 0);
        overdue_udhaar = udhaarData.filter(u => u.due_date && u.due_date < today).reduce((s, u) => s + Number(u.amount_remaining), 0);
      }

      const { data: products } = await supabase.from("products").select("stock, price").eq("business_id", business_id);

      if (products && products.length > 0) {
        inventory_value = products.reduce((s, p) => s + (Number(p.stock) * Number(p.price)), 0);
      }
    }

    const payload = {
      sales:             sales,
      expenses:          expenses > 0 ? expenses : fixedCosts,
      cash_balance:      Math.max(0, sales - expenses),
      udhaar_given:      udhaar_given,
      udhaar_collected:  0,
      inventory_value:   inventory_value
    };

    Object.keys(payload).forEach(k => { if (!payload[k] || isNaN(payload[k])) payload[k] = 0; });

    let mlResult;
    try {
      const mlResponse = await axios.post("http://localhost:8000/predict", payload, { timeout: 5000 });
      mlResult = mlResponse.data;
    } catch (_) {
      mlResult = ruleBased(payload);
    }

    const insights = generateInsights(
      mlResult.cashflow_prediction,
      mlResult.risk_prediction,
      sales,
      payload.expenses,
      overdue_udhaar,
      inventory_value,
      is_synthetic
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
        has_data:        true,
        is_synthetic
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
    console.log(`🔍 Looking up barcode: ${barcode}`);
    let productDetails = null;
    
    // First attempt: BarcodeLookup API
    try {
      const apiKey = process.env.BARCODE_LOOKUP_API_KEY || "4k2m9qob1m0cogop0ezmtr4gho81j4";
      const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${apiKey}`;
      const response = await axios.get(apiUrl, { timeout: 8000 });
      
      if (response.data.products && response.data.products.length > 0) {
        const product = response.data.products[0];
        console.log(`✅ Found product in BarcodeLookup: ${product.title}`);
        productDetails = {
          success: true,
          barcode: barcode,
          productName: product.title || product.product_name || "Unknown Product",
          description: product.description || null,
          image: product.images?.[0] || null,
          price: product.lowest_recorded_price || product.price || null,
        };
      }
    } catch (blError) {
      console.log(`⚠️ BarcodeLookup failed/not found (${blError.message}), checking next extensive dataset...`);
    }

    // Second attempt fallback: OpenFoodFacts (External Dataset)
    if (!productDetails) {
      try {
        const offUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const offResponse = await axios.get(offUrl, { timeout: 8000 });
        
        if (offResponse.data && offResponse.data.status === 1) {
          const product = offResponse.data.product;
          console.log(`✅ Found product in OpenFoodFacts: ${product.product_name}`);
          productDetails = {
            success: true,
            barcode: barcode,
            productName: product.product_name || product.generic_name || product.brands || "Unknown Product",
            description: product.ingredients_text || null,
            image: product.image_url || product.image_front_url || null,
            price: null, // Cannot guarantee pricing here
          };
        }
      } catch (offError) {
        console.log(`⚠️ OpenFoodFacts lookup failed: ${offError.message}`);
      }
    }
    
    if (productDetails) {
      res.json(productDetails);
    } else {
      console.log(`❌ No product found for barcode: ${barcode} in any external datasets`);
      res.status(404).json({ 
        success: false, 
        error: "Product not found in external extensive datasets",
        barcode: barcode 
      });
    }
  } catch (err) {
    console.error("❌ Barcode Lookup Proxy error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Barcode Lookup Proxy failed entirely", 
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