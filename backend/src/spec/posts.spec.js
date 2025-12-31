import supertest from "supertest";
import app from "../app.js";
import { connectDB } from "../db.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";
import User from "../models/User.js";
import Teams from "../models/Teams.js";

let jwtToken;
let testUser;

beforeAll(async () => {
  await connectDB();

  await User.deleteMany({ pseudo: "testuser" });
  await Teams.deleteMany({ name: "red" });

  testTeam = await Teams.create({ name: "red", color: "#FF0000" });
  testUser = await User.create({
    pseudo: "testuser",
    email: "testuser@test.com",
    password_hash: "password123",
    is_admin: true,
    team: "red",
    team_id: testTeam._id,
  });

  jwtToken = await generateValidJwt({ _id: testUser._id });
});

describe("POST /posts", function () {
  it("should create a post", async function () {
    const res = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "46.2044")
      .field("longitude", "6.1432")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("latitude");
    expect(res.body).toHaveProperty("longitude");
    expect(res.body).toHaveProperty("isValidated");
  });

  it("should create a post with the correct latitude and longitude", async function () {
    const latitude = 34.0522;
    const longitude = -118.2437;

    const res = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", latitude)
      .field("longitude", longitude)
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body.latitude).toBe(latitude);
    expect(res.body.longitude).toBe(longitude);
  });

  it("should create a post that is not validated by default", async function () {
    const res = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "40.7128")
      .field("longitude", "-74.0060")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body.isValidated).toBe(false);
  });

  it("should return 400 when no picture is uploaded", async function () {
    const res = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "46.2044")
      .field("longitude", "6.1432")
      .expect(400)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("No picture uploaded.");
  });
});

describe("GET /posts", function () {
  it("should retrieve the list of posts", async function () {
    const res = await supertest(app)
      .get("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeInstanceOf(Array);
  });

  it("should retrieve a post by ID", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    const res = await supertest(app)
      .get(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("latitude");
    expect(res.body).toHaveProperty("longitude");
    expect(res.body).toHaveProperty("isValidated");
  });

  it("should return 404 when post ID does not exist", async function () {
    const fakeId = "507f1f77bcf86cd799439011";
    await supertest(app)
      .get(`/api/v1/posts/${fakeId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(404);
  });

  it("should filter posts by isValidated=true", async function () {
    const res = await supertest(app)
      .get("/api/v1/posts?isValidated=true")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach((post) => {
      expect(post.isValidated).toBe(true);
    });
  });

  it("should filter posts by isValidated=false", async function () {
    const res = await supertest(app)
      .get("/api/v1/posts?isValidated=false")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach((post) => {
      expect(post.isValidated).toBe(false);
    });
  });

  it("should respect limit parameter", async function () {
    const res = await supertest(app)
      .get("/api/v1/posts?limit=5")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });

  it("should respect skip parameter", async function () {
    const firstRes = await supertest(app)
      .get("/api/v1/posts?limit=1")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200);

    const secondRes = await supertest(app)
      .get("/api/v1/posts?limit=1&skip=1")
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200);

    if (firstRes.body.length > 0 && secondRes.body.length > 0) {
      expect(firstRes.body[0]._id).not.toBe(secondRes.body[0]._id);
    }
  });
});

describe("PATCH /posts/:id", function () {
  it("should update a post properties", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    const res = await supertest(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .send({ isValidated: true, latitude: 40.7128, longitude: -74.006 })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body.isValidated).toBe(true);
    expect(res.body.latitude).toBe(40.7128);
    expect(res.body.longitude).toBe(-74.006);
  });

  it("should return 404 when updating non-existent post", async function () {
    const fakeId = "507f1f77bcf86cd799439011";
    await supertest(app)
      .patch(`/api/v1/posts/${fakeId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .send({ isValidated: true })
      .expect(404);
  });

  it("should partially update only isValidated", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "48.8566")
      .field("longitude", "2.3522")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201);

    const postId = createRes.body._id;
    const originalLat = createRes.body.latitude;
    const originalLng = createRes.body.longitude;

    const res = await supertest(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .send({ isValidated: true })
      .expect(200);

    expect(res.body.isValidated).toBe(true);
    expect(res.body.latitude).toBe(originalLat);
    expect(res.body.longitude).toBe(originalLng);
  });

  it("should partially update only coordinates", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "48.8566")
      .field("longitude", "2.3522")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201);

    const postId = createRes.body._id;
    const originalValidation = createRes.body.isValidated;

    const res = await supertest(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .send({ latitude: 35.6762, longitude: 139.6503 })
      .expect(200);

    expect(res.body.latitude).toBe(35.6762);
    expect(res.body.longitude).toBe(139.6503);
    expect(res.body.isValidated).toBe(originalValidation);
  });
});

describe("DELETE /posts/:id", function () {
  it("should delete a post by ID", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    await supertest(app)
      .delete(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(204);

    await supertest(app)
      .get(`/api/v1/posts/${postId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(404);
  });

  it("should return 404 when deleting non-existent post", async function () {
    const fakeId = "507f1f77bcf86cd799439011";
    await supertest(app)
      .delete(`/api/v1/posts/${fakeId}`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(404);
  });
});

describe("GET /posts/:id/picture", function () {
  it("should retrieve the picture of a post", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .set("Cookie", [`token=${jwtToken}`])
      .field("latitude", "46.2044")
      .field("longitude", "6.1432")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201);

    const postId = createRes.body._id;

    const res = await supertest(app)
      .get(`/api/v1/posts/${postId}/picture`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(200);

    expect(res.headers["content-type"]).toBeDefined();
    expect(res.headers["content-length"]).toBeDefined();
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it("should return 404 when picture post does not exist", async function () {
    const fakeId = "507f1f77bcf86cd799439011";
    await supertest(app)
      .get(`/api/v1/posts/${fakeId}/picture`)
      .set("Cookie", [`token=${jwtToken}`])
      .expect(404);
  });
});
