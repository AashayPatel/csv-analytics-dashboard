// middleware/checkChartPermission.js
import Invite from "../models/invite.model.js";

export const checkChartAccess = (requiredRoles = []) => {
  return async (req, res, next) => {
    const userEmail = req.user.email;
    const chartId = req.params.chartId;

    const invite = await Invite.findOne({ chartId, invitedEmail: userEmail, status: "accepted" });

    if (!invite || !requiredRoles.includes(invite.role)) {
      return res.status(403).json({ error: "Access denied for this chart" });
    }

    req.role = invite.role; // optional: attach role to request
    next();
  };
};
