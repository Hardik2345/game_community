const express = require("express");
const { getCachedMatches } = require("../controllers/matchController");

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
router.route("/cached").get(getCachedMatches);

module.exports = router;
