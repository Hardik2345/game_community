const axios = require("axios");
const GV = require("../models/gvModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

const REWARD_PER_WIN = 50;

const calcStatsFromMatches = (matches) => {
  const total = matches.length;
  const wins = matches.filter((m) => m.result === "Victory").length;
  const avgKDA =
    matches.reduce((acc, m) => {
      const [k, d, a] = m.kda?.split(" / ").map(Number) || [0, 1, 0];
      return acc + (k + a) / d;
    }, 0) / total;

  return {
    winPercentage: Math.round((wins / total) * 100),
    kdaRatio: +avgKDA.toFixed(2),
    matchesPlayed: total,
    rating: Math.round(avgKDA * 100),
    totalWins: wins, // 🔥 add this for tracking
  };
};

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

    const { data: matches } = await axios.get(
      "http://localhost:8000/api/v1/matches/valorant-matches",
      {
        headers: {
          riotid: riotId,
        },
      }
    );

    const stats = calcStatsFromMatches(matches);

    // Fetch current GV to compare previous wins
    const existingGV = await GV.findOne({ user: userId });
    const prevWins = existingGV?.totalWins || 0;
    const newWins = stats.totalWins - prevWins;

    const gv = await GV.findOneAndUpdate(
      { user: userId },
      { ...stats, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    // 🪙 Reward only new wins
    if (newWins > 0) {
      await Wallet.findOneAndUpdate(
        { user: userId },
        {
          $inc: { balance: newWins * REWARD_PER_WIN },
          $set: { lastUpdated: Date.now() },
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      status: "success",
      data: gv,
    });
  } catch (err) {
    console.error("GV update error:", err);
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
