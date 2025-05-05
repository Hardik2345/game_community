// utils/gvScheduler.js
const cron = require("node-cron");
const axios = require("axios");
const User = require("../models/userModel");
const GV = require("../models/gvModel");
const rewardWalletIfNeeded = require("./rewardWalletIfNeeded");

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
  };
};

const scheduleGVHourlyUpdate = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ [GV Cron] Hourly GV update started...");

    const users = await User.find({
      riotUsername: { $exists: true },
      riotTag: { $exists: true },
    });

    for (const user of users) {
      const riotId = `${user.riotUsername}#${user.riotTag}`;
      try {
        const { data: matches } = await axios.get(
          "http://localhost:8000/api/v1/matches/valorant-matches",
          {
            headers: {
              riotid: riotId,
            },
          }
        );

        const reward = async () => {
          const users = await User.find({});
          for (const user of users) {
            try {
              await rewardWalletIfNeeded(user._id);
              console.log(`✅ Rewarded ${user.name}`);
            } catch (err) {
              console.error(`❌ Error rewarding ${user.name}:`, err.message);
            }
          }
        };

        reward();

        const stats = calcStatsFromMatches(matches);

        await GV.findOneAndUpdate(
          { user: user._id },
          { ...stats, updatedAt: Date.now() },
          { upsert: true }
        );

        console.log(`✅ GV updated for ${user.name}`);
      } catch (err) {
        console.error(`❌ GV update failed for ${user.name}:`, err.message);
      }
    }
  });
};

module.exports = scheduleGVHourlyUpdate;
