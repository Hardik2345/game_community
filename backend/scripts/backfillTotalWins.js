const mongoose = require("mongoose");
const dotenv = require("dotenv");
const GV = require("../models/gvModel");

// Load your environment variables
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
  .then(() => console.log("✅ DB connection successful"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

const backfillTotalWins = async () => {
  try {
    const gvs = await GV.find();

    for (const gv of gvs) {
      const wins = Math.round((gv.winPercentage / 100) * gv.matchesPlayed);
      gv.totalWins = wins;
      await gv.save();
      console.log(`✅ Updated GV for user: ${gv.user} | Wins: ${wins}`);
    }

    console.log("🎉 Backfill complete.");
    process.exit();
  } catch (err) {
    console.error("❌ Error during backfill:", err);
    process.exit(1);
  }
};

backfillTotalWins();
