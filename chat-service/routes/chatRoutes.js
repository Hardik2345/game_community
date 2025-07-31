const express = require("express");
const chatController = require("./../controllers/chatController");
const messageController = require("./../controllers/messageController");

const router = express.Router();

/**
 * @swagger
 * /chats/:
 *   post:
 *     summary: Create a new chat message
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created
 */
router.route("/").post( messageController.createMessage);

/**
 * @swagger
 * /chats/{teamId}:
 *   get:
 *     summary: Get messages for a team
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: Team ID
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/:teamId", chatController.getTeamMessages);

/**
 * @swagger
 * /chats/game/{gameId}:
 *   get:
 *     summary: Get messages for a game
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  "/game/:gameId",
  chatController.getGameMessages
);

module.exports = router;