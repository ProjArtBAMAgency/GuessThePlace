import express from "express";
import {
  getGuesses,
  getGuessById,
  getGuessesByUser,
  createGuess,
  deleteGuess,
  getUserTotalScore,
} from "../../../controllers/guessesController.js";

import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

/**
 * Routes publiques
 */


/**
 * Routes protégées (authentification requise)
 */
router.get("/", isAuthenticated, getGuesses);
router.get("/:id", isAuthenticated, getGuessById);
router.get("/user/:id", isAuthenticated, getGuessesByUser);
router.get("/user/:id/globalScore", isAuthenticated, getUserTotalScore);
router.post("/", isAuthenticated, createGuess);
router.delete("/:id", isAuthenticated, deleteGuess);

export default router;
