// src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { handleUpload } from "../services/uploadService.js";

const router = express.Router();

// configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
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

router.post(
  "/upload",
  upload.fields([{ name: "cv" }, { name: "project" }]),
  async (req, res) => {
    try {
      const cvFile = req.files.cv?.[0];
      const projectFile = req.files.project?.[0];

      if (!cvFile || !projectFile) {
        return res
          .status(400)
          .json({ error: "Both CV and Project files are required." });
      }

      const result = await handleUpload(cvFile, projectFile);

      res.status(200).json({
        message: "Files uploaded successfully",
        files: result,
      });
    } catch (err) {
      console.error("❌ Upload route error:", err);
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

export default router;
