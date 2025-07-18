const express = require("express");
const inviteController = require("./../controllers/inviteController");
const authController = require("./../controllers/authController");
const router = express.Router();

// Apply authentication middleware so that req.user is populated.
router.use(authController.dynamicProtect);

/**
 * @swagger
 * /invites/:
 *   get:
 *     summary: Get invites for the current user
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invites
 *   post:
 *     summary: Create a new invite
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toUserId:
 *                 type: string
 *               teamId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invite created
 */
router.get("/", inviteController.getInvites);

router.post("/", inviteController.createInvite);

/**
 * @swagger
 * /invites/{inviteId}/accept:
 *   patch:
 *     summary: Accept an invite
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         schema:
 *           type: string
 *         required: true
 *         description: Invite ID
 *     responses:
 *       200:
 *         description: Invite accepted
 */
router.patch("/:inviteId/accept", inviteController.acceptInvite);

/**
 * @swagger
 * /invites/{inviteId}/decline:
 *   patch:
 *     summary: Decline an invite
 *     tags: [Invites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         schema:
 *           type: string
 *         required: true
 *         description: Invite ID
 *     responses:
 *       200:
 *         description: Invite declined
 */
router.patch("/:inviteId/decline", inviteController.declineInvite);

module.exports = router;
