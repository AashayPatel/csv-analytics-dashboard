import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import DataRow from "../models/DataRow.model.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Configure multer for .csv file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `data-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

// POST /api/upload — only admin users allowed
router.post("/upload", verifyToken, requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const results = [];
  const filePath = path.resolve(req.file.path);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
        results.push({
            fields: data,
            uploadedBy: req.user.userId,
            uploadedAt: new Date(),
        });
    })
    .on("end", async () => {
      try {
        await DataRow.insertMany(results);
        console.log("Inserted:", results.length, "records");
        res.status(200).json({ message: "CSV uploaded and saved to MongoDB" });
      } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Failed to insert CSV data" });
      }
    })

    .on("error", (err) => {
      console.error("CSV parsing error:", err);
      res.status(500).json({ error: "CSV parsing failed" });
    });

});

export default router;
