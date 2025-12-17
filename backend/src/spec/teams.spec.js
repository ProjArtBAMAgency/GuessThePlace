import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import Teams from "../models/Teams.js";

describe("Teams API", () => {
  // On remet les mocks propres avant chaque test
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ─────────────────────────────
  // GET /api/v1/teams
  // ─────────────────────────────
  describe("GET /api/v1/teams", () => {
    it("devrait renvoyer un tableau vide si aucune équipe", async () => {
      jest.spyOn(Teams, "find").mockResolvedValueOnce([]);

      const res = await request(app).get("/api/v1/teams");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it("devrait renvoyer les équipes existantes", async () => {
      const fakeTeams = [
        { _id: "1", name: "Team A", color: "blue" },
        { _id: "2", name: "Team B", color: "red" },
      ];

      jest.spyOn(Teams, "find").mockResolvedValueOnce(fakeTeams);

      const res = await request(app).get("/api/v1/teams");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeams);
    });
  });

  // ─────────────────────────────
  // GET /api/v1/teams/:id
  // ─────────────────────────────
  describe("GET /api/v1/teams/:id", () => {
    it("devrait renvoyer une équipe par son id", async () => {
      const fakeTeam = { _id: "123", name: "Team C", color: "green" };

      jest.spyOn(Teams, "findById").mockResolvedValueOnce(fakeTeam);

      const res = await request(app).get("/api/v1/teams/123");

      expect(Teams.findById).toHaveBeenCalledWith("123");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeam);
    });

    it("devrait renvoyer 404 si l'équipe n'existe pas", async () => {
      jest.spyOn(Teams, "findById").mockResolvedValueOnce(null);

      const res = await request(app).get(
        "/api/v1/teams/507f1f77bcf86cd799439011"
      );

      expect(Teams.findById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Équipe non trouvée");
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      jest.spyOn(Teams, "findById").mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/api/v1/teams/anything");

      expect(Teams.findById).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Erreur serveur");
    });
  });

  // ─────────────────────────────
  // POST /api/v1/teams
  // ─────────────────────────────
  describe("POST /api/v1/teams", () => {
    it("devrait créer une équipe avec name et color", async () => {
      // On mock juste save() pour éviter tout accès réseau
      const saveMock = jest
        .spyOn(Teams.prototype, "save")
        .mockResolvedValueOnce();

      const res = await request(app)
        .post("/api/v1/teams")
        .send({ name: "Team D", color: "yellow" });

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "Team D");
      expect(res.body).toHaveProperty("color", "yellow");
      expect(res.body).toHaveProperty("_id"); // généré côté Mongoose sans DB
    });

    it("devrait créer une équipe avec seulement name", async () => {
      const saveMock = jest
        .spyOn(Teams.prototype, "save")
        .mockResolvedValueOnce();

      const res = await request(app)
        .post("/api/v1/teams")
        .send({ name: "Team E" });

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "Team E");
    });

    it("devrait renvoyer 400 si name est manquant", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .send({ color: "red" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Le nom est requis et doit être une chaîne de caractères"
      );
    });

    it("devrait renvoyer 400 si name est vide ou non string", async () => {
      let res = await request(app)
        .post("/api/v1/teams")
        .send({ name: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Le nom est requis et doit être une chaîne de caractères"
      );

      res = await request(app)
        .post("/api/v1/teams")
        .send({ name: 123 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Le nom est requis et doit être une chaîne de caractères"
      );
    });

    it("devrait renvoyer 400 si color n'est pas une string", async () => {
      const res = await request(app)
        .post("/api/v1/teams")
        .send({ name: "Team F", color: 123 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "La couleur doit être une chaîne de caractères"
      );
    });

    it("devrait renvoyer 500 si Mongoose lève une erreur lors du save", async () => {
      const saveMock = jest
        .spyOn(Teams.prototype, "save")
        .mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app)
        .post("/api/v1/teams")
        .send({ name: "Team G", color: "black" });

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Erreur serveur");
    });
  });

  // ─────────────────────────────
  // GET /api/v1/teams/leaderboard
  // ─────────────────────────────
  describe("GET /api/v1/teams/leaderboard", () => {
    it("devrait renvoyer les équipes triées par score décroissant", async () => {
      const fakeTeamsSorted = [
        { _id: "1", name: "Team H", score: 50 },
        { _id: "2", name: "Team I", score: 30 },
        { _id: "3", name: "Team J", score: 10 },
      ];

      const sortMock = jest.fn().mockResolvedValueOnce(fakeTeamsSorted);
      jest.spyOn(Teams, "find").mockReturnValue({ sort: sortMock });

      const res = await request(app).get("/api/v1/teams/leaderboard");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(sortMock).toHaveBeenCalledWith({ score: -1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeTeamsSorted);
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      const sortMock = jest
        .fn()
        .mockRejectedValueOnce(new Error("DB error"));
      jest.spyOn(Teams, "find").mockReturnValue({ sort: sortMock });

      const res = await request(app).get("/api/v1/teams/leaderboard");

      expect(Teams.find).toHaveBeenCalledTimes(1);
      expect(sortMock).toHaveBeenCalledWith({ score: -1 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Erreur serveur");
    });
  });
});
