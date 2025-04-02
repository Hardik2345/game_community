const express = require("express");
const inviteController = require("./../controllers/inviteController");
const authController = require("./../controllers/authController");
const router = express.Router();

// Apply authentication middleware so that req.user is populated.
router.use(authController.protect);

// GET route to fetch invites for the current user
router.get("/", inviteController.getInvites);

router.post("/", inviteController.createInvite);
router.patch("/:inviteId/accept", inviteController.acceptInvite);
router.patch("/:inviteId/decline", inviteController.declineInvite);

module.exports = router;
