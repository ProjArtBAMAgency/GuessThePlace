import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

import User from "../models/User.js";
import Post from "../models/Post.js";
import Guess from "../models/Guess.js";
import Teams from "../models/Teams.js";

import generateValidJwt from "./utils.js";

describe("Guesses API (with authentication)", () => {
  let user;
  let post;
  let token;
  let authCookie;
  let testTeam;
  
  // IDs pour le nettoyage sélectif - UNIQUEMENT les données de test
  let createdUserIds = [];
  let createdPostIds = [];
  let createdGuessIds = [];
  let createdTeamIds = [];

  // ---------------------------------------------------
  // Helpers
  // ---------------------------------------------------
  const createValidUser = async (teamId) => {
    const newUser = await User.create({
      pseudo: "testguess",
      email: "testguess@example.com",
      password_hash: "hashedpassword",
      team_id: teamId
    });
    createdUserIds.push(newUser._id);
    return newUser;
  };

  const createValidPost = async (userId) => {
    const newPost = await Post.create({
      userId: userId,
      latitude: 46.5191,
      longitude: 6.5668,
      picture: "test.jpg",
      isValidated: true
    });
    createdPostIds.push(newPost._id);
    return newPost;
  };

  // -------
  // Setup
  // -------
  beforeAll(async () => {
    // Connexion seulement si pas déjà connecté
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1/my-app-test");
    }

    // Créer une équipe de test d'abord
    testTeam = await Teams.create({ name: "test_team_guess", color: "#FF0000" });
    createdTeamIds.push(testTeam._id);

    // On crée UNE FOIS les données nécessaires
    user = await createValidUser(testTeam._id);
    post = await createValidPost(user._id);
    
    // Générer le token JWT pour l'authentification
    token = await generateValidJwt(user);
    authCookie = `token=${token}`;
  });


  // ----
  // AUTH
  // -----
  it("GET /api/v1/guesses — Should return 401 if not authenticated", async () => {
    const res = await request(app).get("/api/v1/guesses");
    expect(res.status).toBe(401);
  });

  // -------------
  // GET /guesses
  // -------------
  it("GET /api/v1/guesses — Should return all guesses", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 50
    });
    createdGuessIds.push(guess._id);

    const res = await request(app)
      .get("/api/v1/guesses")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // -------------
  // GET /guesses/:id
  // -----------
  it("GET /api/v1/guesses/:id — Should return a specific guess", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 80
    });
    createdGuessIds.push(guess._id);

    const res = await request(app)
      .get(`/api/v1/guesses/${guess._id}`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(guess._id.toString());
  });

  it("GET /api/v1/guesses/:id — Should return 404 if guess not found", async () => {
    const res = await request(app)
      .get("/api/v1/guesses/123456789012345678901234")
      .set("Cookie", authCookie);

    expect(res.status).toBe(404);
  });

  // ------------
  // GET /guesses/user/:id
  // ------------
  it("GET /api/v1/guesses/user/:id — Should return guesses from a user", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 90
    });
    createdGuessIds.push(guess._id);

    const res = await request(app)
      .get(`/api/v1/guesses/user/${user._id}`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("guesses");
    expect(Array.isArray(res.body.guesses)).toBe(true);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("totalPages");
  });

  // ------------
  // GET /guesses/user/:id/globalScore
  // -----------
  it("GET /api/v1/guesses/user/:id/globalScore — Should return total score", async () => {
    const guess1 = await Guess.create({
      user: user._id,
      post: post._id,
      score: 40
    });
    createdGuessIds.push(guess1._id);

    const guess2 = await Guess.create({
      user: user._id,
      post: post._id,
      score: 60
    });
    createdGuessIds.push(guess2._id);

    const res = await request(app)
      .get(`/api/v1/guesses/user/${user._id}/globalScore`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body.totalScore).toBeGreaterThanOrEqual(100);
  });

  // ----------
  // POST /guesses
  // ----------
  it("POST /api/v1/guesses — Should create a guess", async () => {
    // Créer un nouveau post pour éviter le conflit "déjà deviné"
    const newPost = await createValidPost(user._id);
    
    const res = await request(app)
      .post("/api/v1/guesses")
      .set("Cookie", authCookie)
      .send({
        userId: user._id.toString(),
        postId: newPost._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("guess");
    expect(res.body).toHaveProperty("distance");
    expect(res.body).toHaveProperty("score");
    
    // Tracker le guess créé pour le supprimer après
    if (res.body.guess && res.body.guess._id) {
      createdGuessIds.push(res.body.guess._id);
    }
  });

  it("POST /api/v1/guesses — Should return 400 if data missing", async () => {
    const res = await request(app)
      .post("/api/v1/guesses")
      .set("Cookie", authCookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing data" });
  });

  it("POST /api/v1/guesses — Should return 404 if post not found", async () => {
    const res = await request(app)
      .post("/api/v1/guesses")
      .set("Cookie", authCookie)
      .send({
        userId: user._id.toString(),
        postId: "123456789012345678901234",
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Post not found" });
  });

  it("POST /api/v1/guesses — Should return 400 if post not validated", async () => {
    const unvalidatedPost = await Post.create({
      user: user._id,
      latitude: 46.5,
      longitude: 6.5,
      picture: "unvalidated.jpg",
      isValidated: false
    });
    createdPostIds.push(unvalidatedPost._id);

    const res = await request(app)
      .post("/api/v1/guesses")
      .set("Cookie", authCookie)
      .send({
        userId: user._id.toString(),
        postId: unvalidatedPost._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Post not validated" });
  });

  it("POST /api/v1/guesses — Should return 409 if already guessed", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 50
    });
    createdGuessIds.push(guess._id);

    const res = await request(app)
      .post("/api/v1/guesses")
      .set("Cookie", authCookie)
      .send({
        userId: user._id.toString(),
        postId: post._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Already guessed this post" });
  });

  // ------------
  // DELETE /guesses/:id
  // ------------
  it("DELETE /api/v1/guesses/:id — Should delete a guess", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 20
    });
    createdGuessIds.push(guess._id);

    const res = await request(app)
      .delete(`/api/v1/guesses/${guess._id}`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Guess deleted successfully" });
    
    // Retirer du tableau car déjà supprimé par le test
    createdGuessIds = createdGuessIds.filter(id => id.toString() !== guess._id.toString());
  });

  it("DELETE /api/v1/guesses/:id — Should return 404 if not found", async () => {
    const res = await request(app)
      .delete("/api/v1/guesses/123456789012345678901234")
      .set("Cookie", authCookie);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Guess not found" });
  });

  // -------
  // Cleanup - Suppression UNIQUEMENT des données créées pendant ces tests
  // -------
  afterAll(async () => {
    // Supprimer uniquement les guesses créés pendant les tests
    if (createdGuessIds.length > 0) {
      await Guess.deleteMany({ _id: { $in: createdGuessIds } });
      console.log(`✓ Supprimé ${createdGuessIds.length} guess(es) de test`);
    }
    
    // Supprimer uniquement les posts créés pendant les tests
    if (createdPostIds.length > 0) {
      await Post.deleteMany({ _id: { $in: createdPostIds } });
      console.log(`✓ Supprimé ${createdPostIds.length} post(s) de test`);
    }
    
    // Supprimer uniquement l'utilisateur créé pendant les tests
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
      console.log(`✓ Supprimé ${createdUserIds.length} utilisateur(s) de test`);
    }
    
    // Supprimer uniquement l'équipe créée pendant les tests
    if (createdTeamIds.length > 0) {
      await Teams.deleteMany({ _id: { $in: createdTeamIds } });
      console.log(`✓ Supprimé ${createdTeamIds.length} équipe(s) de test`);
    }
  });
});
