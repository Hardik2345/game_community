const axios = require("axios");
const Match = require("../models/matchModel");

exports.getCachedMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest cached match data
    const cache = await Match.findOne({ user: userId });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // If cache exists and is less than 1 hour old
    if (cache && cache.cachedAt > oneHourAgo) {
      return res.status(200).json({ status: "cached", data: cache.matches });
    }

    // Else fetch fresh data
    const { data: matches } = await axios.get(
      "http://localhost:8000/api/v1/matches/valorant-matches"
    );

    await Match.findOneAndUpdate(
      { user: userId },
      { matches, cachedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: "fresh", data: matches });
  } catch (err) {
    console.error("Failed to fetch or store matches:", err);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
};
