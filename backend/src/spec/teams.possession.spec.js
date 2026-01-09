import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

const fakePossession = {
  blue: { score: 10, guesses: [] },
  red: { score: 5, guesses: [] },
};

await jest.unstable_mockModule("../controllers/teamsController.js", () => ({
  getTeams: jest.fn(),
  getTeamById: jest.fn(),
  createTeam: jest.fn(),
  getTeamsLeaderboard: jest.fn(),
  getTeamsPossession: jest.fn((req, res) =>
    res.status(200).json(fakePossession)
  ),

  computeTeamsPossession: jest.fn().mockResolvedValue(fakePossession),
}));

const { default: app } = await import("../app.js");

describe("GET /api/v1/Teams/possession", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("devrait renvoyer la possession des équipes", async () => {
    const res = await request(app).get("/api/v1/Teams/possession");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakePossession);
  });
});
