const Wallet = require("../models/walletModel");
const GV = require("../models/gvModel");

const REWARD_PER_WIN = 50;

// Utility to credit wallet based on GV wins
const creditWinsToWallet = async (userId) => {
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

  return wallet;
};

// GET /api/v1/wallets/me
exports.getMyWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        status: "fail",
        message: "Wallet not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: wallet,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// POST /api/v1/wallets/reward
exports.rewardMyWalletFromWins = async (req, res) => {
  try {
    const wallet = await creditWinsToWallet(req.user.id);
    res.status(200).json({
      status: "success",
      data: wallet,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
