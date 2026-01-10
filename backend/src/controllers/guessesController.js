import mongoose from "mongoose";
import { getDistance } from "geolib";
import Guess from "../models/Guess.js";
import Post from "../models/Post.js";
import { WSServerPubSub, WSServerRoomManager, WSServerRoom, WSServerGameRoom, WSServerError } from 'wsmini';
import { publishTeamsPossession } from "../ws/publishPossession.js";
/* 
   CONTROLLER: Functions related to "Guesses"
   (a "guess" = user's attempt to locate a post) */
/**
 

 * GET /api/v1/guesses
 * Retrieves all guesses with pagination
 */
export async function getGuesses(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const guesses = await Guess.find()
      .sort({ createdAt: -1 })
      .populate("user", "pseudo") 
      .populate("post", "picture")
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(guesses);
  } catch (err) {
    console.error("Error fetching guesses:", err);
    res.status(500).json({ error: "Server error" });
  }
}



/**
 * GET /api/v1/guesses/:id
 * Retrieves a specific guess by its ID
 */
export async function getGuessById(req, res) {
  try {
    const guess = await Guess.findById(req.params.id)
      .populate("user", "pseudo")
      .populate("post", "picture");

    if (!guess) return res.status(404).json({ error: "Guess not found" });

    res.json(guess);
  } catch (err) {
    console.error("Error fetching guess:", err);
    res.status(500).json({ error: "Server error" });
  }
}



/**
 * GET /api/v1/guesses/user/:id
 * Retrieves all guesses made by a user
 */
export async function getGuessesByUser(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userId = req.params.id;

    const findOptions = { user: userId };
    
    const total = await Guess.countDocuments(findOptions);
    const totalPages = Math.ceil(total / limit);

    const guesses = await Guess.find(findOptions)
      .populate("user", "pseudo")
      .populate({
        path: "post",
        select: "latitude longitude userId",
        populate: {
          path: "userId",
          select: "pseudo"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ guesses, total, totalPages });
  } catch (error) {
    console.error("Error fetching guesses by user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getGuessesByPost(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const postId = req.params.id;

    const findOptions = { post: postId };
    
    const total = await Guess.countDocuments(findOptions);
    const totalPages = Math.ceil(total / limit);

    const guesses = await Guess.find(findOptions).populate("user", "pseudo")
      .skip(skip)
      .limit(limit);

    res.json({ guesses, total, totalPages });
  } catch (error) {
    console.error("Error fetching guesses by post:", error);
    res.status(500).json({ error: "Server error" });
  }
}



/**
 * POST /api/v1/guesses
 * Creates a new guess (attempt)
 */
export async function createGuess(req, res) {
  try {
    const userId = req.user.sub;
    const { postId, guessedLat, guessedLon } = req.body;

    // Check that all required data is present
    if (!userId || !postId || guessedLat == null || guessedLon == null)
      return res.status(400).json({ error: "Missing data" });

    // Check that the post exists and is validated
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!post.isValidated)
      return res.status(400).json({ error: "Post not validated" });

    // Check if the user has already guessed this post
    const existing = await Guess.findOne({ user: userId, post: postId });
    if (existing)
      return res.status(409).json({ error: "Already guessed this post" });

    // Calculate the distance between the guessed location and the actual position
    const distance = getDistance(
      { latitude: post.latitude, longitude: post.longitude },
      { latitude: Number(guessedLat), longitude: Number(guessedLon) }
    );

    // New calculation:
    // Max score 10,000 (distance = 0m), min 10 points (>220km)
    // Meter precision
    // Progressive/logarithmic score:
    // 10,000 points at 0m, ~9,800 at 1km, ~6,666 at 50km, ~5,000 at 100km, ~3,333 at 200km, etc.
    const D = 50 // calibration parameter (km)
    const distanceKm = distance / 1000
    let score = Math.round(10000 / (1 + (distanceKm / D)))
    if (score < 1) score = 1

    // Create the new guess
    const newGuess = await Guess.create({
      score,
      user: userId,
      post: postId,
    });

    res.status(201).json({ guess: newGuess, distance, score });

    publishTeamsPossession().catch((e) => {
  console.error("Failed to publish teams possession (WS):", e);
});
  } catch (err) {
    console.error("Error creating guess:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * DELETE /api/v1/guesses/:id
 * Deletes an existing guess
 */
export async function deleteGuess(req, res) {
  try {
    const guess = await Guess.findByIdAndDelete(req.params.id);
    if (!guess) return res.status(404).json({ error: "Guess not found" });
    res.json({ message: "Guess deleted successfully" });
  } catch (err) {
    console.error("Error deleting guess:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/guesses/user/:id/globalScore
 * Calculates a user's total score (sum of their guesses)
 */
export async function getUserTotalScore(req, res) {
  try {
    const userId = req.params.id;

    const result = await Guess.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$user", totalScore: { $sum: "$score" } } },
    ]);

    res.json({ userId, totalScore: result[0]?.totalScore || 0 });
  } catch (err) {
    console.error("Error calculating total score:", err);
    res.status(500).json({ error: "Server error" });
  }
}
