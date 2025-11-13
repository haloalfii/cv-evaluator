// src/queue/worker.js
import Queue from "bull";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHROMA_URL = process.env.CHROMA_DB_URL || "http://localhost:8000";
const chroma = new ChromaClient({ path: CHROMA_URL });

// Connect to Bull queue
const evaluationQueue = new Queue("evaluation", {
  redis: { port: 6379, host: "127.0.0.1" },
});

async function queryCollection(name, queryText, nResults = 3) {
  try {
    const collection = await chroma.getCollection({ name });
    const result = await collection.query({
      queryTexts: [queryText],
      nResults,
    });
    return result.documents?.[0]?.join("\n\n") || "";
  } catch (err) {
    console.error(`❌ Failed to query ${name}:`, err.message);
    return "";
  }
}

async function readFileText(filePath) {
  try {
    if (!fs.existsSync(filePath)) return "";
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") {
      // optional: use pdf-parse here
      return "[PDF content omitted for brevity]";
    }
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("❌ Failed to read file:", filePath, err.message);
    return "";
  }
}

// The actual worker
evaluationQueue.process(async (job) => {
  const { id, cvPath, projectPath } = job.data;
  console.log("Processing job:", id);
  console.log("CV Path:", cvPath);
  console.log("Project Path:", projectPath);

  try {
    // Step 1. Load uploaded files
    const cvText = await readFileText(cvPath);
    const projectText = await readFileText(projectPath);

    // Step 2. Query all ground-truth data from Chroma
    const jobDesc = await queryCollection(
      "job_descriptions",
      "backend AI engineer role requirements"
    );
    const caseBrief = await queryCollection(
      "case_study_briefs",
      "prompt chaining case study brief"
    );
    const rubric = await queryCollection(
      "scoring_rubrics",
      "evaluation criteria for candidate project"
    );

    // Step 3. Combine context for the LLM
    const systemPrompt = `
You are an AI evaluator for a technical hiring system.
You are given a candidate's CV, project submission, and ground-truth evaluation criteria.
Analyze the candidate's match and provide:
- CV match rate (0–1)
- CV feedback
- Project score (1–5)
- Project feedback
- Overall summary
Return the result as a JSON object.
`;

    const userPrompt = `
# JOB DESCRIPTION
${jobDesc}

# CASE STUDY BRIEF
${caseBrief}

# SCORING RUBRIC
${rubric}

# CANDIDATE CV
${cvText}

# PROJECT SUBMISSION
${projectText}
`;

    // Step 4. Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    const result = JSON.parse(raw);

    console.log("✅ Evaluation result:", result);
    return result;
  } catch (err) {
    console.error("❌ Evaluation failed:", err);
    throw err;
  }
});
