import express from "express";
import dotenv from "dotenv";
import chromaClient from "./config/chroma.js";
import uploadRouter from "./routes/uploadRoute.js";
import evaluateRoute from "./routes/evaluationRoute.js";
import resultRoute from "./routes/resultRoute.js";

dotenv.config();

const app = express();

// Root endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI CV Evaluator API (basic)" });
});

app.use(express.json());

// Use upload router
app.use("/", uploadRouter);
app.use("/", evaluateRoute);
app.use("/", resultRoute);

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
