import Teams from "../models/Teams.js";
import Guess from "../models/Guess.js";

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
  const result = await Guess.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: "$user.team_id",
        totalPoints: { $sum: "$score" },
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "_id",
        as: "team",
      },
    },
    { $unwind: "$team" },
    {
      $project: {
        _id: 0,
        teamId: "$team._id",
        name: "$team.name",
        color: "$team.color",
        totalPoints: 1,
      },
    },
    { $sort: { totalPoints: -1 } },
  ]);

  const teamA = result[0] ?? null;
  const teamB = result[1] ?? null;

  const pointsA = teamA?.totalPoints ?? 0;
  const pointsB = teamB?.totalPoints ?? 0;
  const total = pointsA + pointsB;

  const percentA = total === 0 ? 50 : Math.round((pointsA / total) * 100);
  const percentB = 100 - percentA;

  return {
    teamA,
    teamB,
    percentA,
    percentB,
    totalPoints: total,
  };
}
export async function getTeamsPossession(req, res) {
  try {
    const data = await computeTeamsPossession();
    return res.status(200).json(data);
  } catch (err) {
    console.error("getTeamsPossession error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
