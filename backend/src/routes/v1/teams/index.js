import express from "express";

import {
  getTeams,
  getTeamById,
  createTeam,
  getTeamsLeaderboard,
  getTeamsPossession
} from "../../../controllers/teamsController.js";

const router = express.Router();

router.get("/", getTeams);
router.get("/leaderboard", getTeamsLeaderboard);
router.get("/possession", getTeamsPossession);
router.get("/:id", getTeamById);
router.post("/", createTeam);

export default router;  