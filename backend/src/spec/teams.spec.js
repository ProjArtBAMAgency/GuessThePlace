import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import Teams from "../models/Teams.js";
import jwt from "jsonwebtoken";

function makeToken(payload) {
  const secret = process.env.JWT_SECRET || "changeme";
  return jwt.sign(payload, secret);
}

describe("Teams API", () => {
  // On remet les mocks propres avant chaque test
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ─────────────────────────────
  // GET /api/v1/Teams
  // ─────────────────────────────
  describe("GET /api/v1/Teams", () => {
    it("devrait renvoyer un tableau vide si aucune équipe", async () => {
      jest.spyOn(Teams, "find").mockResolvedValueOnce([]);

      const res = await request(app).get("/api/v1/Teams");
      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it("devrait renvoyer les équipes existantes", async () => {
      const fakeTeams = [
        { _id: "1", name: "Teams A", color: "blue" },
        { _id: "2", name: "Teams B", color: "red" },
      ];

      jest.spyOn(Teams, "find").mockResolvedValueOnce(fakeTeams);

      const res = await request(app).get("/api/v1/Teams");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeams);
    });
  });

  // ─────────────────────────────
  // GET /api/v1/Teams/:id
  // ─────────────────────────────
  describe("GET /api/v1/Teams/:id", () => {
    it("devrait renvoyer une équipe par son id", async () => {
      const fakeTeams = { _id: "123", name: "Teams C", color: "green" };

      jest.spyOn(Teams, "findById").mockResolvedValueOnce(fakeTeams);

      const res = await request(app).get("/api/v1/Teams/123");

      expect(Teams.findById).toHaveBeenCalledWith("123");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeams);
    });

    it("devrait renvoyer 404 si l'équipe n'existe pas", async () => {
      jest.spyOn(Teams, "findById").mockResolvedValueOnce(null);

      const res = await request(app).get(
        "/api/v1/Teams/507f1f77bcf86cd799439011"
      );

      expect(Teams.findById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Équipe non trouvée");
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      jest.spyOn(Teams, "findById").mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/v1/Teams/anything");

      expect(Teams.findById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Erreur serveur");
    });
  });

  // ─────────────────────────────
  // POST /api/v1/Teams
  // ─────────────────────────────
  describe("POST /api/v1/Teams", () => {
  it("devrait renvoyer 401 si pas authentifié", async () => {
    const res = await request(app)
      .post("/api/v1/Teams")
      .send({ name: "Teams X", color: "black" });

    expect(res.statusCode).toBe(401);
  });

  it("devrait renvoyer 403 si user n'est pas admin", async () => {
    const token = makeToken({ is_admin: false });

    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "Teams X", color: "black" });

    expect(res.statusCode).toBe(403);
  });

  it("devrait renvoyer 400 si name est manquant", async () => {
    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${makeToken({ is_admin: true })}`])
      .send({ color: "red" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Le nom est requis et doit être une chaîne de caractères"
    );
  });

  it("devrait renvoyer 400 si name est vide ou non string", async () => {
    const token = makeToken({ is_admin: true });

    let res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Le nom est requis et doit être une chaîne de caractères"
    );

    res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: 123 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Le nom est requis et doit être une chaîne de caractères"
    );
  });

  it("devrait renvoyer 400 si color n'est pas une string", async () => {
    const token = makeToken({ is_admin: true });

    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "Teams F", color: 123 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "La couleur doit être une chaîne de caractères"
    );
  });

  it("devrait créer une équipe avec name et color", async () => {
    const saveMock = jest.spyOn(Teams.prototype, "save").mockResolvedValueOnce();
    const token = makeToken({ is_admin: true });

    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "Teams D", color: "blue" });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Teams D");
    expect(res.body).toHaveProperty("color", "blue");
    expect(res.body).toHaveProperty("_id");
  });

  it("devrait créer une équipe avec seulement name", async () => {
    const saveMock = jest.spyOn(Teams.prototype, "save").mockResolvedValueOnce();
    const token = makeToken({ is_admin: true });

    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "Teams E" });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Teams E");
  });

  it("devrait renvoyer 500 si Mongoose lève une erreur lors du save", async () => {
    const saveMock = jest
      .spyOn(Teams.prototype, "save")
      .mockRejectedValueOnce(new Error("DB error"));

    const token = makeToken({ is_admin: true });

    const res = await request(app)
      .post("/api/v1/Teams")
      .set("Cookie", [`token=${token}`])
      .send({ name: "Teams G", color: "black" });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Erreur serveur");
  });
});


  // ─────────────────────────────
  // GET /api/v1/Teams/leaderboard
  // ─────────────────────────────
  describe("GET /api/v1/Teams/leaderboard", () => {
    it("devrait renvoyer les équipes triées par score décroissant", async () => {
      const fakeTeamsSorted = [
        { _id: "1", name: "Teams H", score: 50 },
        { _id: "2", name: "Teams I", score: 30 },
        { _id: "3", name: "Teams J", score: 10 },
      ];

      const sortMock = jest.fn().mockResolvedValueOnce(fakeTeamsSorted);
      jest.spyOn(Teams, "find").mockReturnValue({ sort: sortMock });

      const res = await request(app).get("/api/v1/Teams/leaderboard");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(sortMock).toHaveBeenCalledWith({ score: -1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeamsSorted);
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      const sortMock = jest.fn().mockRejectedValueOnce(new Error("DB error"));
      jest.spyOn(Teams, "find").mockReturnValue({ sort: sortMock });

      const res = await request(app).get("/api/v1/Teams/leaderboard");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(sortMock).toHaveBeenCalledWith({ score: -1 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Erreur serveur");
    });
  });
});
