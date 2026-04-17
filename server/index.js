import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createChatbotRouter } from "./chatbot.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount chatbot routes under /api
app.use("/api", createChatbotRouter());

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
