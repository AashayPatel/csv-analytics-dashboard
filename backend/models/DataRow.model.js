import mongoose from "mongoose";
const { Schema } = mongoose;

const dataRowSchema = new mongoose.Schema({
  fields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Add timestamps for better data management
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model("DataRow", dataRowSchema);
