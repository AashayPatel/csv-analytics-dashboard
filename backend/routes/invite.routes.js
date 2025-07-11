// routes/invite.routes.js
import express from "express";
import Invite from "../models/invite.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import Chart from "../models/Chart.js";

const router = express.Router();

// POST /api/invite
router.post("/", verifyToken, async (req, res) => {
  const { invitedEmail, chartId, role } = req.body;

  if (!invitedEmail || !chartId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const invite = new Invite({
      invitedEmail,
      invitedBy: req.user.userId,  // use userId from token payload
      chartId,
      role: role || "viewer",
    });

    await invite.save();
    return res.status(201).json({ message: "Invite sent", invite });
  } catch (err) {
    console.error("❌ Error sending invite:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Charts uploaded by this user
    const ownedCharts = await Chart.find({ uploadedBy: userId });

    // Accepted invites for this user
    const acceptedInvites = await Invite.find({
      invitedEmail: userEmail,
      status: "accepted"
    }).populate("chartId");

    const invitedCharts = acceptedInvites.map(inv => inv.chartId);

    const allCharts = [...ownedCharts, ...invitedCharts];

    console.log("👤 Owned:", ownedCharts);
    console.log("📩 Accepted Invites:", acceptedInvites);
    console.log("📊 Invited Charts:", invitedCharts);


    res.json(allCharts);
  } catch (err) {
    console.error("❌ Error fetching charts:", err);
    res.status(500).json({ error: "Failed to fetch charts" });
  }
});


router.get("/pending", verifyToken, async (req, res) => {
  try {
    const invites = await Invite.find({
      invitedEmail: req.user.email,
      status: { $ne: "accepted" },
    }).populate("chartId", "fileName"); // only bring chart fileName for display

    res.json({ invites });
  } catch (err) {
    console.error("❌ Error fetching pending invites:", err);
    res.status(500).json({ error: "Failed to fetch pending invites" });
  }
});


router.get("/chart/:chartId/invites", verifyToken, async (req, res) => {
  const { chartId } = req.params;

  try {
    const invites = await Invite.find({ chartId });
    res.json({ invites });
  } catch (err) {
    console.error("Error fetching invites:", err);
    res.status(500).json({ error: "Failed to fetch invites" });
  }
});

router.patch("/:inviteId/accept", verifyToken, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const invite = await Invite.findById(inviteId);

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }
    console.log("🔍 Comparing:", invite.invitedEmail, req.user.email);

    if (invite.invitedEmail !== req.user.email) {
      return res.status(403).json({ error: "This invite is not for your account" });
    }

    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted", invite });
  } catch (err) {
    console.error("Failed to accept invite:", err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
});


router.delete("/:inviteId", verifyToken, async (req, res) => {
  const { inviteId } = req.params;

  try {
    const invite = await Invite.findById(inviteId);

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    // Optional: Only allow the sender or recipient to delete
    if (
      req.user.email !== invite.invitedEmail &&
      req.user.userId !== invite.invitedBy.toString()
    ) {
      return res.status(403).json({ error: "Not authorized to delete this invite" });
    }

    await invite.deleteOne();
    res.json({ message: "✅ Invite deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting invite:", err);
    res.status(500).json({ error: "Failed to delete invite", details: err.message });
  }
});


export default router;
