// src/ingest/jobDescriptionIngest.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ChromaClient } from "chromadb";

dotenv.config();

const CHROMA_URL = process.env.CHROMA_DB_URL || "http://localhost:8000";
const chroma = new ChromaClient({ path: CHROMA_URL });

/**
 * Split text into chunks with optional overlap
 */
function chunkText(text, chunkSize = 900, chunkOverlap = 150) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if (current.length + p.length + 1 <= chunkSize) {
      current = current ? current + "\n\n" + p : p;
    } else {
      if (current) chunks.push(current);
      if (p.length > chunkSize) {
        for (let i = 0; i < p.length; i += chunkSize - chunkOverlap) {
          chunks.push(p.slice(i, i + chunkSize));
        }
        current = "";
      } else {
        current = p;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Generate fake embeddings
 */
function generateFakeEmbeddings(chunks, dim = 1536) {
  return chunks.map(() =>
    Array.from({ length: dim }, () => Math.random())
  );
}

async function ingest() {
  try {
    const infile = path.resolve("src/data/job_description.txt");
    if (!fs.existsSync(infile)) {
      console.error("❌ ERROR: src/data/job_description.txt not found.");
      process.exit(1);
    }

    const raw = fs.readFileSync(infile, "utf-8");
    const chunks = chunkText(raw, 900, 150);
    console.log(`📄 Split into ${chunks.length} chunks.`);

    // Generate fake embeddings
    const embeddings = generateFakeEmbeddings(chunks);

    const colName = "job_descriptions";
    let collection;
    try {
      collection = await chroma.getCollection({ name: colName });
      console.log("✅ Collection exists:", colName);
    } catch {
      collection = await chroma.createCollection({ name: colName });
      console.log("🆕 Created collection:", colName);
    }

    const ids = chunks.map((_, i) => `jobdesc-${Date.now()}-${i}`);
    const metadatas = chunks.map((_, i) => ({
      source: "job_description",
      chunk_index: i,
      created_at: new Date().toISOString(),
    }));

    console.log("📥 Upserting into Chroma...");
    await collection.add({
      ids,
      documents: chunks,
      embeddings,
      metadatas,
    });

    console.log(`✅ Ingested ${chunks.length} chunks into collection '${colName}'`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Ingest failed:", err);
    process.exit(1);
  }
}

ingest();