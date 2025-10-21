const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Guess = require('../models/guess.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');


// Calcul de distance entre deux coordonnées GPS (en mètres), avec une formule qui renvois un résultat en mètre entre deux distances GPS sur une surface de globe.
// Utilisation de la formule de Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371e3; // Terre en mètres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance en mètres
} 


// === ROUTES ===

// GET /guesses → toutes les guesses (paginated)
// La route utilise Mongoose pour interroger la base de données
// récupère pour chaque guess :
// Le pseudo de l'utilisateur qui a fait la tentative
// L'image du post concerné
// En cas d'erreur, elle renvoie un message "Server error" avec un code 500

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query; // valeurs par défaut de pagination
    const skip = (page - 1) * limit;

    const guesses = await Guess.find()
      .populate('user', 'pseudo')
      .populate('post', 'picture')
      .skip(Number(skip))
      .limit(Number(limit));

    res.json(guesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /guesses/:id → guess spécifique
// La route permet de récupérer une seule "guess" (tentative de localisation) à partir de son identifiant unique.
router.get('/:id', async (req, res) => {
  try {
    const guess = await Guess.findById(req.params.id)
      .populate('user', 'pseudo')
      .populate('post', 'picture');
    if (!guess) return res.status(404).json({ error: 'Guess not found' });
    res.json(guess);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /guesses/user/:id → guesses d’un user
// Cette route permet de récupérer l'historique des tentatives de localisation d'un utilisateur spécifique
router.get('/user/:id', async (req, res) => {
  try {
    const guesses = await Guess.find({ user: req.params.id })
      .populate('post', 'picture latitude longitude');
    res.json(guesses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /guesses
// gère la création d'une nouvelle tentative de localisation ("guess")
router.post('/', async (req, res) => {
  try {
    const { userId, postId, guessedLat, guessedLon } = req.body;

    // Vérifier les données requises 
    if (!userId || !postId || guessedLat == null || guessedLon == null) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Trouver le post concerné
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Vérif: post validé ? Question de ne pas deviner des posts non validés
    if (!post.is_validated) {
      return res.status(400).json({ error: 'Post not validated' });
    }

    // Vérif: l’utilisateur ne peut pas deviner sa propre photo 
    if (post.user.toString() === userId.toString()) {
      return res.status(403).json({ error: 'Cannot guess your own post' });
    }

    // Vérif: déjà deviné ? Un utilisateur ne peut deviner qu'une seule fois par post
    const existing = await Guess.findOne({ user: userId, post: postId });
    if (existing) {
      return res.status(409).json({ error: 'Already guessed this post' });
    }

    // Calcul distance et score, !!!!!définir la logique de score !!!!!!
    const distance = haversine(
      post.latitude,
      post.longitude,
      Number(guessedLat),
      Number(guessedLon)
    );

    let score = Math.max(0, Math.round(1000 - distance / 10));
    if (score < 0) score = 0;

    // Création du guess
    //Enregistre dans la base de données :
    // Le score calculé
    //L'identifiant de l'utilisateur
    // L'identifiant de la photo
    const newGuess = await Guess.create({
      score,
      user: userId,
      post: postId
    });

    res.status(201).json({ guess: newGuess, distance, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /guesses/:id → supprimer une guess (admin ou test)
//Cette route permet de supprimer une tentative de localisation ("guess") de la base de données 
router.delete('/:id', async (req, res) => {
  try {
    const guess = await Guess.findByIdAndDelete(req.params.id);
    if (!guess) return res.status(404).json({ error: 'Guess not found' });
    res.json({ message: 'Guess deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /guesses/user/:id/globalScore → somme de tous les scores d’un user
//  permet de calculer le score total d'un utilisateur en additionnant tous les points qu'il a obtenus avec ses tentatives de localisation
router.get('/user/:id/globalScore', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await Guess.aggregate([
        // 1. Filtre les tentatives pour ne garder que celles de l'utilisateur
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      // 2. Groupe et additionne tous les scores
      { $group: { _id: '$user', totalScore: { $sum: '$score' } } }
    ]);

    const total = result[0]?.totalScore || 0;
    res.json({ userId, totalScore: total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
