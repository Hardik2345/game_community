const express = require("express");
const { getCachedMatches } = require("../controllers/matchController");
const { protect } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /dashboard/cached:
 *   get:
 *     summary: Get cached matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cached matches
 */
router.route("/cached").get(protect, getCachedMatches);

module.exports = router;
