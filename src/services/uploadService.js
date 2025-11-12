import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_BASE_PATH = "src/uploads";

export async function handleUpload(cvFile, projectFile) {
  try {
    // 🆔 Generate one unique ID for both files
    const uploadId = uuidv4();

    // Define folder structure
    const uploadFolder = path.join(UPLOAD_BASE_PATH, uploadId);
    const cvFolder = path.join(uploadFolder, "cv");
    const projectFolder = path.join(uploadFolder, "project");

    // Ensure folders exist
    fs.mkdirSync(cvFolder, { recursive: true });
    fs.mkdirSync(projectFolder, { recursive: true });

    // Move uploaded files into their folders
    const cvDest = path.join(cvFolder, cvFile.originalname);
    const projectDest = path.join(projectFolder, projectFile.originalname);

    fs.renameSync(cvFile.path, cvDest);
    fs.renameSync(projectFile.path, projectDest);

    // Parse text from PDF files
    const cvBuffer = fs.readFileSync(cvDest);
    const projectBuffer = fs.readFileSync(projectDest);

    const cvText = new PDFParse(new Uint8Array(cvBuffer));
    const projectText = new PDFParse(new Uint8Array(projectBuffer));

    const cvResult = await cvText.getText();
    const projectResult = await projectText.getText();

    // Return combined upload object with 1 ID
    return {
      id: uploadId,
      cv: {
        filename: cvFile.originalname,
      },
      project: {
        filename: projectFile.originalname,
      },
    };
  } catch (err) {
    console.error("❌ UploadService Error:", err.message);
    throw new Error("Failed to process upload files");
  }
}
