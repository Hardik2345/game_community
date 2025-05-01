const express = require("express");
const { protect } = require("../controllers/authController");
const { updateGV, getGV } = require("../controllers/gvController");

const router = express.Router();

router.route("/update-my-gv").post(protect, updateGV);
router.route("/:userId").get(getGV);

module.exports = router;
