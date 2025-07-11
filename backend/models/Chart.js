import mongoose from "mongoose";

const sharedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Make sure this matches your user model
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor"],
    default: "viewer",
  },
});

const chartSchema = new mongoose.Schema({
  fileName: String,
  chartType: String,
  selectedXField: String,
  selectedYField: String,
  fieldTypes: Object,
  headers: [String],
  csvData: [Object],  
  isPublic: {
    type: Boolean,
    default: false,
  },  
  sharedWith: [sharedUserSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

export default mongoose.model("Chart", chartSchema);
