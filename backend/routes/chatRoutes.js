const express = require("express");
const chatController = require("./../controllers/chatController");
const messageController = require("./../controllers/messageController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").post(authController.protect, messageController.createMessage);

router.get("/:teamId", authController.protect, chatController.getTeamMessages);
router.get(
  "/game/:gameId",
  authController.protect,
  chatController.getGameMessages
);

module.exports = router;
