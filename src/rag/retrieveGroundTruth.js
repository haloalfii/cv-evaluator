import chromaClient from "../config/chroma.js";

export async function retrieveGroundTruth(collectionName, query, topK = 5) {
  try {
    const collection = await chromaClient.getCollection({ name: collectionName });

    const result = await collection.query({
      queryTexts: [query],
      nResults: topK,
    });

    // result.documents is an array of arrays (one per query)
    const chunks = result.documents[0] || [];
    return chunks;
  } catch (err) {
    console.error(`❌ Failed to retrieve from ${collectionName}:`, err.message);
    return [];
  }
}
