import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_BASE_PATH = "src/uploads";

export async function handleUpload(cvFile, projectFile) {
  try {
    // 🆔 Generate unique IDs
    const cvId = `cv-${uuidv4()}`;
    const projectId = `project-${uuidv4()}`;

    // Define folders
    const cvFolder = path.join(UPLOAD_BASE_PATH, "cv");
    const projectFolder = path.join(UPLOAD_BASE_PATH, "project");

    // Ensure folders exist
    fs.mkdirSync(cvFolder, { recursive: true });
    fs.mkdirSync(projectFolder, { recursive: true });

    // Create new filenames with IDs
    const cvFilename = `${cvId}-${cvFile.originalname}`;
    const projectFilename = `${projectId}-${projectFile.originalname}`;

    // Destination paths
    const cvDest = path.join(cvFolder, cvFilename);
    const projectDest = path.join(projectFolder, projectFilename);

    // Move files to their folders
    fs.renameSync(cvFile.path, cvDest);
    fs.renameSync(projectFile.path, projectDest);

    // Parse PDFs using PDFParse
    const cvBuffer = fs.readFileSync(cvDest);
    const projectBuffer = fs.readFileSync(projectDest);

    // Return structured info
    return {
      cv: {
        id: cvId,
        filename: cvFilename,
        path: cvDest
      },
      project: {
        id: projectId,
        filename: projectFilename,
        path: projectDest
      },
    };
  } catch (err) {
    console.error("❌ UploadService Error:", err.message);
    throw new Error("Failed to process upload files");
  }
}
