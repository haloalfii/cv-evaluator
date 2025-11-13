// src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { handleUpload } from "../services/uploadService.js";
import { saveUpload } from "../utils/dataStore.js";

const router = express.Router();

// --- Ensure upload folders exist ---
const baseUploadPath = "src/uploads";
const cvPath = path.join(baseUploadPath, "cv");
const projectPath = path.join(baseUploadPath, "project");

[baseUploadPath, cvPath, projectPath].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- Configure multer storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cv") cb(null, cvPath);
    else if (file.fieldname === "project") cb(null, projectPath);
    else cb(new Error("Invalid field name"), false);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

// --- Upload route ---
router.post(
  "/upload",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "project", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 🧠 Check files
      if (!req.files || !req.files.cv || !req.files.project) {
        console.error("❌ No files detected:", req.files);
        return res
          .status(400)
          .json({ error: "Both CV and Project files are required." });
      }

      const cvFile = req.files.cv[0];
      const projectFile = req.files.project[0];

      console.log("📂 Uploaded files:", {
        cv: cvFile.path,
        project: projectFile.path,
      });

      // 🧠 Process PDFs
      const result = await handleUpload(cvFile, projectFile);

      // 🆔 Create one shared ID for both files (for later evaluation)
      const uploadId = crypto.randomUUID();

      saveUpload({
        id: uploadId,
        cvId: result.cv.id,
        cvPath: result.cv.path,
        projectId: result.project.id,
        projectPath: result.project.path,
      });

      // 🧠 Return consistent structure
      res.status(200).json({
        message: "Files uploaded successfully",
        id: uploadId,
        files: result,
      });
    } catch (err) {
      console.error("❌ Upload route error:", err);
      res.status(500).json({ error: "Failed to upload files", details: err.message });
    }
  }
);

export default router;