const express = require("express");
const { getCachedMatches } = require("../controllers/matchController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.route("/cached").get(protect, getCachedMatches);

module.exports = router;
