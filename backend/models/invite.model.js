// models/invite.model.js
import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  invitedEmail: {
    type: String,
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chart",
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor"],
    default: "viewer",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.models.Invite || mongoose.model("Invite", InviteSchema);
