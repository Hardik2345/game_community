const express = require("express");
const teamController = require("./../controllers/teamControllers");
// const authController = require("./../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /teams/:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teams
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Team created
 */
router
  .route("/")
  .get( teamController.getAllTeams)
  .post( teamController.createTeam);

/**
 * @swagger
 * /teams/add-member:
 *   patch:
 *     summary: Add a member to a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added to team
 */
router
  .route("/add-member")
  .patch( teamController.addMemberToTeam);

module.exports = router;
