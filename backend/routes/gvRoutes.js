const express = require("express");
const { updateGV, getGV } = require("../controllers/gvController");

const router = express.Router();

/**
 * @swagger
 * /gv/update-my-gv:
 *   post:
 *     summary: Update your GV (Game Value)
 *     tags: [GV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *     responses:
 *       200:
 *         description: GV updated
 */
router.route("/update-my-gv").post(updateGV);

/**
 * @swagger
 * /gv/{userId}:
 *   get:
 *     summary: Get GV for a user
 *     tags: [GV]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: GV data
 */
router.route("/:userId").get(getGV);

module.exports = router;
