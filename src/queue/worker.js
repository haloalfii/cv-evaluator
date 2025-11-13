import fs from "fs";
import path from "path";
import { evaluationQueue } from "./evaluationQueue.js";

const UPLOAD_JSON_PATH = "src/data/uploads.json";

evaluationQueue.process(async (job) => {
  try {
    const { cvId, projectId } = job.data;

    // Read upload.json
    const uploads = JSON.parse(fs.readFileSync(UPLOAD_JSON_PATH, "utf-8"));

    // Find the uploaded files by ID
    const uploadEntry = uploads.find(
      (u) => u.cvId === cvId || u.projectId === projectId
    );

    if (!uploadEntry) {
      throw new Error("Uploaded file IDs not found in JSON");
    }

    const cvPath = uploadEntry.cvPath;
    const projectPath = uploadEntry.projectPath;

    console.log("Processing job:", job.id);
    console.log("CV Path:", cvPath);
    console.log("Project Path:", projectPath);

    // TODO: Run AI evaluation logic using cvPath & projectPath

    // Fake result for now
    return {
      cv_match_rate: 0.82,
      cv_feedback:
        "Strong in backend and cloud, limited AI integration experience...",
      project_score: 4.5,
      project_feedback:
        "Meets prompt chaining requirements, lacks error handling robustness...",
      overall_summary:
        "Good candidate fit, would benefit from deeper RAG knowledge...",
    };
  } catch (error) {
    console.error("Job failed:", error);
    throw err; // Bull marks it as failed
  }
});
