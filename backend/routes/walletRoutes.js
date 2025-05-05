const express = require("express");
const { protect } = require("../controllers/authController");
const {
  getMyWallet,
  rewardMyWalletFromWins,
} = require("../controllers/walletController");

const router = express.Router();

// Get your own wallet balance
router.get("/me", protect, getMyWallet);

// Reward wallet based on wins (manual trigger)
router.post("/reward", protect, rewardMyWalletFromWins);

module.exports = router;
