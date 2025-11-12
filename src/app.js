import express from "express";
import dotenv from "dotenv";
import chromaClient from "./config/chroma.js";
import uploadRouter from "./routes/uploadRoute.js";

dotenv.config();

const app = express();

// Root endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI CV Evaluator API (basic)" });
});

// Use upload router
app.use("/", uploadRouter);

(async () => {
  try {
    const collections = await chromaClient.listCollections();
    console.log("✅ Connected to ChromaDB. Collections:", collections);
  } catch (err) {
    console.error("❌ Failed to connect to ChromaDB:", err.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
