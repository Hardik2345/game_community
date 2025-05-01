const { fork } = require("child_process");
const path = require("path");
const GV = require("../models/gvModel");
const User = require("../models/userModel");

// Util: fallback stats if something fails
const defaultStats = {
  winPercentage: 0,
  kdaRatio: 0,
  matchesPlayed: 0,
  rating: 0,
};

// 🔄 UPDATE GV using child worker
exports.updateGV = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.riotUsername || !user.riotTag) {
      return res.status(400).json({
        status: "fail",
        message: "Riot username and tag are required to update GV",
      });
    }

    const riotId = `${user.riotUsername}#${user.riotTag}`;
    const workerPath = path.join(__dirname, "../scraperWorker.js");
    const child = fork(workerPath);

    // Send riotId to child process
    child.send({ riotId });

    child.on("message", async (message) => {
      if (message.success) {
        const stats = message.stats;

        const gv = await GV.findOneAndUpdate(
          { user: userId },
          { ...stats, updatedAt: Date.now() },
          { new: true, upsert: true }
        );

        return res.status(200).json({
          status: "success",
          data: gv,
        });
      } else {
        console.error("Scraper failed:", message.error);
        return res.status(500).json({
          status: "error",
          message: "Scraper failed to retrieve match data.",
        });
      }
    });

    child.on("error", (err) => {
      console.error("Child process error:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal scraper error.",
      });
    });
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({ status: "error", message: "Failed to update GV" });
  }
};

// 📥 GET GV for a specific user
exports.getGV = async (req, res) => {
  try {
    const gv = await GV.findOne({ user: req.params.userId }).populate("user");
    if (!gv) {
      return res.status(404).json({ message: "GV not found" });
    }

    res.status(200).json({
      status: "success",
      data: gv,
    });
  } catch (err) {
    console.error("Get GV error:", err);
    res.status(500).json({ status: "error", message: "Failed to retrieve GV" });
  }
};
