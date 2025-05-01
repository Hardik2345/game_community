const mongoose = require("mongoose");
const dotenv = require("dotenv");
const GV = require("../models/gvModel");
const User = require("../models/userModel");

dotenv.config({ path: "./config.env" }); // adjust path to your .env

const backfillGV = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL || process.env.DATABASE);

    const users = await User.find();
    console.log(`✅ Found ${users.length} users.`);

    let createdCount = 0;

    for (const user of users) {
      const existingGV = await GV.findOne({ user: user._id });

      if (!existingGV) {
        await GV.create({
          user: user._id,
          winPercentage: 0,
          kdaRatio: 0,
          matchesPlayed: 0,
          rating: 0,
        });
        createdCount++;
        console.log(`✅ GV created for ${user.name}`);
      }
    }

    console.log(`🎯 Done. ${createdCount} new GVs created.`);
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

backfillGV();
