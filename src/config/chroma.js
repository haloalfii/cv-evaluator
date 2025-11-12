import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const chromaClient = new ChromaClient({
  path: process.env.CHROMA_DB_URL, // default local chromadb endpoint
});

export default chromaClient;
