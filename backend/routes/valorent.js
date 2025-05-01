const express = require("express");
const scrapeValorantMatches = require("../services/extract");

const router = express.Router();

router.get("/valorant-matches", async (req, res) => {
  const data = await scrapeValorantMatches(); // optionally accept query param
  res.json(data);
});

module.exports = router;
