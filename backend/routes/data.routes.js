import express from "express";
import {
  processDataResponse,
  validateNumericField
} from "../middleware/dataProcessor.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import DataRow from "../models/DataRow.model.js";

const router = express.Router();

/**
 * @swagger
 * /api/data/fields:
 *   get:
 *     summary: Get all available fields with their types
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fields with type information
 */
router.get("/fields", 
  verifyToken,
  processDataResponse,
  (req, res) => {
    const { fieldTypes, count } = res.locals.processedData;
    res.json({
      success: true,
      count,
      fields: Object.keys(fieldTypes),
      fieldTypes
    });
  }
);

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get paginated data with optional field filtering
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *           example: "price,quantity"
 *     responses:
 *       200:
 *         description: Paginated data response
 */
router.get("/",
  verifyToken,
  processDataResponse,
  (req, res) => {
    const { data, count } = res.locals.processedData;
    res.json({
      success: true,
      count,
      data
    });
  }
);

/**
 * @swagger
 * /api/data/stats/{field}:
 *   get:
 *     summary: Get statistics for a numeric field
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Field statistics
 *       400:
 *         description: Invalid field type
 */
router.get("/stats/:field",
  verifyToken,
  processDataResponse,
  validateNumericField('field'),
  (req, res) => {
    const field = req.params.field;
    const numericValues = res.locals.processedData.data
      .map(item => Number(item[field]))
      .filter(v => !isNaN(v));

    if (numericValues.length === 0) {
      return res.json({
        success: false,
        message: "No valid numeric values found"
      });
    }

    res.json({
      success: true,
      field,
      count: numericValues.length,
      stats: calculateStatistics(numericValues)
    });
  }
);

// Helper functions
function calculateStatistics(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    sum,
    median: calculateMedian(sorted),
    stdDev: calculateStandardDeviation(sorted, sum)
  };
}

function calculateMedian(sortedValues) {
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 !== 0
    ? sortedValues[mid]
    : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

function calculateStandardDeviation(values, sum) {
  const mean = sum / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

export default router;