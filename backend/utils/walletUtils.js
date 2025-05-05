// utils/walletUtils.js
const GV = require("../models/gvModel");
const Wallet = require("../models/walletModel");

const REWARD_PER_WIN = 50;

const creditWinsToWallet = async (userId) => {
  try {
    const gv = await GV.findOne({ user: userId });
    if (!gv || typeof gv.totalWins !== "number") {
      throw new Error("GV record with totalWins not found.");
    }

    const rewardAmount = gv.totalWins * REWARD_PER_WIN;

    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        $inc: { balance: rewardAmount },
        $set: { lastUpdated: Date.now() },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Wallet credited: ₹${rewardAmount} for user ${userId}`);
    return wallet;
  } catch (err) {
    console.error("❌ Failed to credit wallet:", err.message);
    throw err;
  }
};

module.exports = {
  creditWinsToWallet,
};
