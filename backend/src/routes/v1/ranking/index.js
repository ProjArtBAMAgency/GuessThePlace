import isAuthenticated from "../../../middlewares/authentication.js";
import express from "express";
import { getRanking } from "../../../controllers/rankingController.js";

const router = express.Router();

// Route pour obtenir le classement global des utilisateurs
// Montée sous /api/v1/ranking
router.get("/", isAuthenticated, getRanking);

export default router;