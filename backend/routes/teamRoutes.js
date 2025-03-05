const express = require("express");
const teamController = require("./../controllers/teamControllers");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, teamController.getAllTeams)
  .post(authController.protect, teamController.createTeam);

module.exports = router;
