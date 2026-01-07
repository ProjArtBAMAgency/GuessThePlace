import supertest from "supertest";
import app from "../app.js";
import { connectDB } from "../db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";

let agent;
let user;

beforeAll(async () => {
  await connectDB();
  agent = supertest.agent(app); // pour conserver les cookies

  const passwordHash = await bcrypt.hash("password123", 10);

  user = await User.create({
    email: "login@test.com",
    pseudo: "loginuser",
    password_hash: passwordHash,
    is_admin: false,
    team: "red",
  });

});


describe("POST /api/v1/authentification/login", () => {
  it("should authenticate user and set a token cookie", async () => {
    const res = await agent
      .post("/api/v1/authentification/login")
      .send({
        email: "login@test.com",
        password: "password123",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("message", "Login successful");

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith("token="))).toBe(true);
  });
});


describe("POST /api/v1/authentification/logout", () => {
  it("should clear the token cookie when authenticated", async () => {
    const res = await agent
      .post("/api/v1/authentification/logout")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("message", "Logout successful");
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(
      cookies.some(c => c.startsWith("token=") && c.includes("token=;"))
    ).toBe(true);
  });
});


afterAll(async () => {
    await User.deleteMany({ email: "login@test.com" });
    await mongoose.connection.close();
});