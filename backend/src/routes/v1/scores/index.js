import express from "express";
import { getUserPostsScore } from "../../../controllers/scoresController.js";
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

router.get("/:id", isAuthenticated, getUserPostsScore);

export default router;
