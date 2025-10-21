
// mise en place du modèle Mongoose pour les Guesses

const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    default: 0
  },
  // Références aux modèles User et Post
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Référence au modèle Post
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
  // mise en place des timestamps pour createdAt et updatedAt
}, {
  timestamps: true
});

module.exports = mongoose.model('Guess', guessSchema);
