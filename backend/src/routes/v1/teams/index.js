import express from "express";

import {
  getTeams,
  getTeamById,
  createTeam,
  getTeamsLeaderboard
} from "../../../controllers/teamsController.js";

import authenticateToken from "../../../middlewares/authentication.js";
import isAdmin from "../../../middlewares/admin.js";

const router = express.Router();

router.get("/", getTeams);
router.get("/leaderboard", getTeamsLeaderboard);
router.get("/:id", getTeamById);


router.post("/", authenticateToken, isAdmin, createTeam);

export default router;  