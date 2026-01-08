import Teams from "../models/Teams.js";
import Guess from "../models/Guess.js";
import User from "../models/User.js";

/**
 * GET /api/v1/teams
 * Récupère toutes les équipes
 */
export async function getTeams(req, res) {
  try {
    const teams = await Teams.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/teams/:id
 * Récupère une équipe par son ID
 * Le paramètre id est passé dans l'URL
 * L'ID est assigné de base par Mongoose lors de la création du document
 */
export async function getTeamById(req, res) {
  try {
    const team = await Teams.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Équipe non trouvée" });
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * POST /api/v1/teams
 * Crée une nouvelle équipe
 */
export async function createTeam(req, res) {
  try {
    const { name, color } = req.body;

    if (color && typeof color !== "string") {
      return res
        .status(400)
        .json({ error: "La couleur doit être une chaîne de caractères" });
    } else if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({
          error: "Le nom est requis et doit être une chaîne de caractères",
        });
    }
    const newTeam = new Teams({ name, color });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/teams/leaderboard
 * Récupère le classement des équipes basé sur les scores
 */
export async function getTeamsLeaderboard(req, res) {
  try {
    const teams = await Teams.find().sort({ score: -1 }); // Tri décroissant par score
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}


export async function computeTeamsPossession() {
  const blueTeamDoc = await Teams.findOne({ color: 'blue' });
  const redTeamDoc = await Teams.findOne({ color: 'red' });

  const blueUsers = blueTeamDoc ? await User.find({ team_id: blueTeamDoc._id }).select("_id pseudo") : [];
  const redUsers = redTeamDoc ? await User.find({ team_id: redTeamDoc._id }).select("_id pseudo") : [];

  const blueGuesses = await Guess.find({ user: { $in: blueUsers.map((u) => u._id) } })
    .populate("post", "id");
  const redGuesses = await Guess.find({ user: { $in: redUsers.map((u) => u._id) } })
    .populate("post", "id");

  const scoreBlue = blueGuesses.reduce((acc, guess) => acc + (guess.score ?? 0), 0);
  const scoreRed = redGuesses.reduce((acc, guess) => acc + (guess.score ?? 0), 0);

  return {
    blue: { score: scoreBlue, guesses: blueGuesses },
    red: { score: scoreRed, guesses: redGuesses },
  }
}

export async function getTeamsPossession(req, res) {
  try {
    return res.json(await computeTeamsPossession());

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
