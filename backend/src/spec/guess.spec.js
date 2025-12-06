import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Guess from "../models/Guess.js";

describe("Guesses API", () => {
  let user;
  let post;

  // Helper pour créer un user valide
  const createValidUser = () => {
    return User.create({
      pseudo: "testuser",
      email: "test@test.com",
      password_hash: "hashedpassword",
      team: "red"
    });
  };

  // Helper pour créer un post valide
  const createValidPost = (userId) => {
    return Post.create({
      user: userId,
      latitude: 46.5191,
      longitude: 6.5668,
      picture: "test.jpg",
      isValidated: true
    });
  };

  beforeAll(async () => {
    // Connexion seulement si pas déjà connecté
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1/my-app-test");
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Guess.deleteMany({});

    user = await createValidUser();
    post = await createValidPost(user._id);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ---------------------------------------------------
  // GET /guesses
  // ---------------------------------------------------
  it("GET /api/v1/guesses — Should return all guesses", async () => {
    await Guess.create({
      user: user._id,
      post: post._id,
      score: 50
    });

    const res = await request(app).get("/api/v1/guesses");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // ---------------------------------------------------
  // GET /guesses/:id
  // ---------------------------------------------------
  it("GET /api/v1/guesses/:id — Should return a specific guess", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 80
    });

    const res = await request(app).get(`/api/v1/guesses/${guess._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(guess._id.toString());
  });

  it("GET /api/v1/guesses/:id — Should return 404 if guess not found", async () => {
    const res = await request(app).get("/api/v1/guesses/123456789012345678901234");
    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------
  // GET /guesses/user/:id
  // ---------------------------------------------------
  it("GET /api/v1/guesses/user/:id — Should return guesses from a user", async () => {
    await Guess.create({
      user: user._id,
      post: post._id,
      score: 90
    });

    const res = await request(app).get(`/api/v1/guesses/user/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // ---------------------------------------------------
  // GET /guesses/user/:id/globalScore
  // ---------------------------------------------------
  it("GET /api/v1/guesses/user/:id/globalScore — Should return total score", async () => {
    await Guess.create({
      user: user._id,
      post: post._id,
      score: 40
    });

    await Guess.create({
      user: user._id,
      post: post._id,
      score: 60
    });

    const res = await request(app).get(`/api/v1/guesses/user/${user._id}/globalScore`);

    expect(res.status).toBe(200);
    expect(res.body.totalScore).toBe(100);
  });

  // ---------------------------------------------------
  // POST /guesses
  // ---------------------------------------------------
  it("POST /api/v1/guesses — Should create a guess", async () => {
    const res = await request(app)
      .post("/api/v1/guesses")
      .send({
        userId: user._id.toString(),
        postId: post._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("guess");
    expect(res.body).toHaveProperty("distance");
    expect(res.body).toHaveProperty("score");
  });

  it("POST /api/v1/guesses — Should return 400 if data missing", async () => {
    const res = await request(app)
      .post("/api/v1/guesses")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Données manquantes" });
  });

  it("POST /api/v1/guesses — Should return 404 if post not found", async () => {
    const res = await request(app)
      .post("/api/v1/guesses")
      .send({
        userId: user._id.toString(),
        postId: "123456789012345678901234",
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Post non trouvé" });
  });

  it("POST /api/v1/guesses — Should return 400 if post not validated", async () => {
    const unvalidatedPost = await Post.create({
      user: user._id,
      latitude: 46.5,
      longitude: 6.5,
      picture: "unvalidated.jpg",
      isValidated: false
    });

    const res = await request(app)
      .post("/api/v1/guesses")
      .send({
        userId: user._id.toString(),
        postId: unvalidatedPost._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Post non validé" });
  });

  it("POST /api/v1/guesses — Should return 409 if already guessed", async () => {
    // Créer une première guess
    await Guess.create({
      user: user._id,
      post: post._id,
      score: 50
    });

    // Tenter de créer une deuxième guess
    const res = await request(app)
      .post("/api/v1/guesses")
      .send({
        userId: user._id.toString(),
        postId: post._id.toString(),
        guessedLat: 46.52,
        guessedLon: 6.57
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Déjà deviné ce post" });
  });

  // ---------------------------------------------------
  // DELETE /guesses/:id
  // ---------------------------------------------------
  it("DELETE /api/v1/guesses/:id — Should delete a guess", async () => {
    const guess = await Guess.create({
      user: user._id,
      post: post._id,
      score: 20
    });

    const res = await request(app).delete(`/api/v1/guesses/${guess._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Guess supprimée avec succès" });
  });

  it("DELETE /api/v1/guesses/:id — Should return 404 if not found", async () => {
    const res = await request(app).delete("/api/v1/guesses/123456789012345678901234");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Guess non trouvée" });
  });
});