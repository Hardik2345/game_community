const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  lastRewardedWins: { type: Number, default: 0 },
});

// Auto-update timestamp when balance changes
walletSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
