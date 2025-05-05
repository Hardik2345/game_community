// utils/rewardWalletIfNeeded.js
const GV = require("../models/gvModel");
const Wallet = require("../models/walletModel");

const rewardWalletIfNeeded = async (userId) => {
  const gv = await GV.findOne({ user: userId });
  if (!gv) throw new Error("GV not found");

  const wallet = await Wallet.findOne({ user: userId });
  const lastRewarded = wallet?.lastRewardedWins || 0;
  const newWins = gv.totalWins - lastRewarded;

  if (newWins > 0) {
    const amountToAdd = newWins * 50;

    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        $inc: { balance: amountToAdd },
        $set: { lastRewardedWins: gv.totalWins },
      },
      { new: true, upsert: true }
    );

    console.log(
      `✅ Wallet updated: +₹${amountToAdd} (Total: ₹${updatedWallet.balance})`
    );
    return updatedWallet;
  }

  console.log("⚠️ No new wins. Wallet not updated.");
  return wallet;
};

module.exports = rewardWalletIfNeeded;
