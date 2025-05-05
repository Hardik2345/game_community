const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

// Load environment variables
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });

const createWallets = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const existing = await Wallet.findOne({ user: user._id });
      if (!existing) {
        await Wallet.create({
          user: user._id,
          balance: 0,
        });
        console.log(`🆕 Wallet created for user: ${user.name} (${user._id})`);
      }
    }

    console.log("🎉 Wallet creation complete.");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating wallets:", err);
    process.exit(1);
  }
};

createWallets();
