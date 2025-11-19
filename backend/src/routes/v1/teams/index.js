import express from "express";

import {
  getTeams,
  getTeamById,
  createTeam,
  getTeamsLeaderboard
} from "../../../controllers/teamsController.js";

const router = express.Router();

router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.get("/leaderboard", getTeamsLeaderboard);

export default router;  