// src/routes/resultRoute.js
import express from "express";
import { evaluationQueue } from "../queue/evaluationQueue.js";

const router = express.Router();

router.get("/result/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await evaluationQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState(); // queued, active, completed, failed
    const result = job.returnvalue || null;

    res.status(200).json({
      id: job.id,
      status: state,
      result,
    });
  } catch (err) {
    console.error("❌ Result route error:", err.message);
    res.status(500).json({ error: "Failed to fetch job result" });
  }
});

export default router;
