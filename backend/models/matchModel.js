const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  matches: {
    type: Array,
    required: true,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 2, // optional TTL index (2 hours)
  },
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
