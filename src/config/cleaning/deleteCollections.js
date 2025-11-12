import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const chroma = new ChromaClient({ path: process.env.CHROMA_DB_URL });

async function deleteCollections() {
  try {
    await chroma.deleteCollection({ name: "job_descriptions" });
    await chroma.deleteCollection({ name: "case_study_briefs" });
    await chroma.deleteCollection({ name: "scoring_rubrics" });
    console.log("✅ Collection deleted.");
  } catch (err) {
    console.error("❌ Failed to delete collection:", err);
  }
}

deleteCollections();
