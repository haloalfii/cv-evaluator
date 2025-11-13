// src/routes/evaluateRoutes.js
import express from "express";
import { evaluationQueue } from "../queue/evaluationQueue.js";

const router = express.Router();

router.post("/evaluate", async (req, res) => {
  const { cvId, projectId, jobTitle } = req.body;

  if (!cvId || !projectId || !jobTitle) {
    return res
      .status(400)
      .json({ error: "cvId, projectId, and jobTitle are required" });
  }

  try {
    const job = await evaluationQueue.add({ cvId, projectId, jobTitle });
    res.status(200).json({ id: job.id, status: "queued" });
  } catch (err) {
    console.error("❌ Evaluate route error:", err.message);
    res.status(500).json({ error: "Failed to enqueue evaluation job" });
  }
});

export default router;
