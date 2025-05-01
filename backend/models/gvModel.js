const mongoose = require("mongoose");

const gvSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  winPercentage: {
    type: Number,
    default: 0,
  },
  kdaRatio: {
    type: Number,
    default: 0,
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const GV = mongoose.model("GV", gvSchema);
module.exports = GV;
