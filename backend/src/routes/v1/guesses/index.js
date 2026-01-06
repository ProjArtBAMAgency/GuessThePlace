import express from "express";
import {
  getGuesses,
  getGuessById,
  getGuessesByUser,
  createGuess,
  deleteGuess,
  getUserTotalScore,
  getGuessesByPost
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
router.get("/user/:id/globalScore", isAuthenticated, getUserTotalScore);
router.get("/user/:id", isAuthenticated, getGuessesByUser);
router.get("/posts/:id", isAuthenticated, getGuessesByPost);
router.get("/:id", isAuthenticated, getGuessById);
router.post("/", isAuthenticated, createGuess);
router.delete("/:id", isAuthenticated, deleteGuess);

export default router;
