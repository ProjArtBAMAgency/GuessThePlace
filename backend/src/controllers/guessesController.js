import mongoose from "mongoose";
import { getDistance } from "geolib";
import Guess from "../models/Guess.js";
import Post from "../models/Post.js";

/* 
   CONTROLEUR : Fonctions liées aux "Guesses"
   (une "guess" = tentative de localisation d’un post par un utilisateur) */
/**
 

 * GET /api/v1/guesses
 * Récupère toutes les guesses avec pagination
 */
export async function getGuesses(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const guesses = await Guess.find()
      .populate("user", "pseudo") 
      .populate("post", "picture")
      .skip(Number(skip))
      .limit(Number(limit));

    res.json(guesses);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}



/**
 * GET /api/v1/guesses/:id
 * Récupère une guess spécifique par son ID
 */
export async function getGuessById(req, res) {
  try {
    const guess = await Guess.findById(req.params.id)
      .populate("user", "pseudo")
      .populate("post", "picture");

    if (!guess) return res.status(404).json({ error: "Guess non trouvée" });

    res.json(guess);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}



/**
 * GET /api/v1/guesses/user/:id
 * Récupère toutes les guesses faites par un utilisateur
 */
export async function getGuessesByUser(req, res) {
  try {
    const guesses = await Guess.find({ user: req.params.id }).populate(
      "post",
      "picture latitude longitude"
    );

    res.json(guesses);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}



/**
 * POST /api/v1/guesses
 * Crée une nouvelle guess (tentative)
 */
export async function createGuess(req, res) {
  try {
    const { userId, postId, guessedLat, guessedLon } = req.body;

    // Vérifie que toutes les données nécessaires sont présentes
    if (!userId || !postId || guessedLat == null || guessedLon == null)
      return res.status(400).json({ error: "Données manquantes" });

    // Vérifie que le post existe et qu’il est validé
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post non trouvé" });
    if (!post.isValidated)
      return res.status(400).json({ error: "Post non validé" });

    // Vérifie si l’utilisateur a déjà fait une guess sur ce post
    const existing = await Guess.findOne({ user: userId, post: postId });
    if (existing)
      return res.status(409).json({ error: "Déjà deviné ce post" });

    // Calcule la distance entre la localisation devinée et la vraie position
    const distance = getDistance(
      { latitude: post.latitude, longitude: post.longitude },
      { latitude: Number(guessedLat), longitude: Number(guessedLon) }
    );

    // Calcule un score basé sur la distance (plus proche = meilleur score)
    // Exemple simple : score max 100000, diminue de 1 point tous les 10 mètres
    const score = Math.max(0, Math.round(100000 - distance / 10));

    // Crée la nouvelle guess
    const newGuess = await Guess.create({
      score,
      user: userId,
      post: postId,
    });

    res.status(201).json({ guess: newGuess, distance, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * DELETE /api/v1/guesses/:id
 * Supprime une guess existante
 */
export async function deleteGuess(req, res) {
  try {
    const guess = await Guess.findByIdAndDelete(req.params.id);
    if (!guess) return res.status(404).json({ error: "Guess non trouvée" });
    res.json({ message: "Guess supprimée avec succès" });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/guesses/user/:id/globalScore
 * Calcule le score total d’un utilisateur (somme de ses guesses)
 */
export async function getUserTotalScore(req, res) {
  try {
    const userId = req.params.id;

    const result = await Guess.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$user", totalScore: { $sum: "$score" } } },
    ]);

    res.json({ userId, totalScore: result[0]?.totalScore || 0 });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
}
