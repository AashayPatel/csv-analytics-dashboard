import express from "express";
import { saveChart, getCharts, inviteToChart } from "../controllers/chart.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import Chart from "../models/Chart.js";
import Invite from "../models/invite.model.js";


const router = express.Router();

// Save a chart (protected)
router.post("/", verifyToken, saveChart);

// Get charts for authenticated user (protected)
router.get("/", verifyToken, getCharts);

// Delete a chart by ID (protected & ownership check)
router.delete("/:id", verifyToken, async (req, res) => {
  const chartId = req.params.id;

  // Debug logs
  console.log("🔍 req.user:", req.user);
  console.log("🔍 Available properties:", Object.keys(req.user));

  try {
    const chart = await Chart.findById(chartId);
    if (!chart) {
      return res.status(404).json({ error: "Chart not found" });
    }

    console.log("🔍 chart.uploadedBy:", chart.uploadedBy);
    console.log("🔍 req.user.userId:", req.user.userId);
    console.log("🔍 req.user.id:", req.user.id);

    // Try both possible property names
    const userId = req.user.userId || req.user.id;
    
    if (!chart.uploadedBy || chart.uploadedBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: Not your chart" });
    }

    await chart.deleteOne();
    res.json({ message: "✅ Chart deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.patch("/:id", verifyToken, async(req, res) => {
  const chartId = req.params.id;
  const { chartType, selectedXField, selectedYField, fileName } = req.body;
  try {
      const chart = await Chart.findById(chartId);
      if (!chart) return res.status(404).json({ error: "Chart not found" });

      if (!chart.uploadedBy || chart.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
      }

      if (chartType) chart.chartType = chartType;
      if (selectedXField) chart.selectedXField = selectedXField;
      if (selectedYField) chart.selectedYField = selectedYField;
      if (fileName) chart.fileName = fileName;

      await chart.save();
      res.json({ message: "Chart updated successfully", chart });

  } catch (error) {
      console.error("❌ Update error:", error);
      res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.patch("/:id/share", verifyToken, async (req, res) => {
  try {
    const chart = await Chart.findByIdAndUpdate(
      req.params.id,
      { isPublic: true },
      { new: true }
    );
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.json(chart);
  } catch (error) {
    console.error("Error sharing chart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);
    if (!chart) return res.status(404).json({ error: "Chart not found" });

    res.json(chart);
  } catch (err) {
    console.error("Error fetching public chart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/invite", verifyToken, inviteToChart);


export default router;
