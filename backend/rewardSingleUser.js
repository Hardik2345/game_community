// rewardSingleUser.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const Wallet = require("./models/walletModel");
const GV = require("./models/gvModel");

dotenv.config({ path: "./config.env" });

const rewardSingleUser = async (userId) => {
  await mongoose.connect(process.env.DATABASE);

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const gv = await GV.findOne({ user: user._id });
  if (!gv) throw new Error("GV not found");

  const wins = gv.totalWins || 0;
  const amount = wins * 50;

  await Wallet.findOneAndUpdate(
    { user: user._id },
    { balance: amount },
    { upsert: true }
  );
  c;
  console.log(`✅ Wallet updated: ₹${amount} for ${user.name}`);
  mongoose.disconnect();
};

rewardSingleUser("6811d0d01c89a38edab0f3cf");
