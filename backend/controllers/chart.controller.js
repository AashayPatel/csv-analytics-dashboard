import Chart from "../models/Chart.js";
import User from "../models/user.model.js";

// ONE-TIME CLEANUP: Delete all existing charts (remove this after running once)

export const saveChart = async (req, res) => {
  try {
    // Add the authenticated user's ID to the chart data
    const chartData = {
      ...req.body,
      uploadedBy: req.user.userId  // This was missing!
    };
    
    const chart = new Chart(chartData);
    await chart.save();
    res.status(201).json(chart);
  } catch (err) {
    res.status(500).json({ message: "Error saving chart", error: err.message });
  }
};

export const getCharts = async (req, res) => {
  try {
    // Only get charts that belong to the authenticated user
    const charts = await Chart.find({ uploadedBy: req.user.userId })
                              .sort({ createdAt: -1 });
    res.status(200).json(charts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching charts", error: err.message });
  }
};

export const inviteToChart = async (req, res) => {
  const chartId = req.params.id;
  const { email, role } = req.body;
  const userId = req.user.userId;

  try {
    const chart = await Chart.findById(chartId);
    if (!chart) return res.status(404).json({ error: "Chart not found" });

    if (!chart.uploadedBy.equals(userId)) {
      return res.status(403).json({ error: "You are not the chart owner" });
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ error: "User not found" });
    }

    if (chart.uploadedBy.equals(userToShare._id)) {
      return res.status(400).json({ error: "You are already the owner" });
    }

    const alreadyShared = chart.sharedWith.find(
      (entry) => entry.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ error: "User already invited" });
    }

    chart.sharedWith.push({
      user: userToShare._id,
      role: role || "viewer",
    });

    await chart.save();
    res.status(200).json({ message: "User invited", sharedWith: chart.sharedWith });
  } catch (err) {
    console.error("Error inviting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
