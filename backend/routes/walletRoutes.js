const express = require("express");
const { dynamicProtect } = require("../controllers/authController");
const {
  getMyWallet,
  rewardMyWalletFromWins,
} = require("../controllers/walletController");

const router = express.Router();

/**
 * @swagger
 * /wallets/me:
 *   get:
 *     summary: Get your wallet balance
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data
 */
router.get("/me", dynamicProtect, getMyWallet);

/**
 * @swagger
 * /wallets/reward:
 *   post:
 *     summary: Reward your wallet based on wins
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet rewarded
 */
router.post("/reward", dynamicProtect, rewardMyWalletFromWins);

module.exports = router;
