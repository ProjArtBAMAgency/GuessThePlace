import express from "express";
import {
  getGuesses,
  getGuessById,
  getGuessesByUser,
  createGuess,
  deleteGuess,
  getUserTotalScore,
} from "../../../controllers/guessesController.js";

const router = express.Router();

/**
 * Routes liées aux "Guesses"
 */


router.get("/", getGuesses);
router.get("/:id", getGuessById);
router.get("/user/:id", getGuessesByUser);
router.get("/user/:id/globalScore", getUserTotalScore);
router.post("/", createGuess);
router.delete("/:id", deleteGuess);

export default router;
