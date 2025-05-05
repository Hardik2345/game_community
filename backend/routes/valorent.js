const express = require("express");
const scrapeValorantMatches = require("../services/extract");

const router = express.Router();

/**
 * @swagger
 * /matches/valorant-matches:
 *   get:
 *     summary: Get Valorant matches (scraped)
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of Valorant matches
 */
router.get("/valorant-matches", async (req, res) => {
  const data = await scrapeValorantMatches(); // optionally accept query param
  res.json(data);
});

module.exports = router;
