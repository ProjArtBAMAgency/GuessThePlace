import supertest from "supertest";
import app from "../app.js";
import { connectDB } from "../db.js";
import "dotenv/config";

beforeAll(async () => {
  await connectDB();
});

describe("POST /posts", function () {
  it("should create a post", async function () {
    const res = await supertest(app)
      .post("/api/v1/posts")
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
      .field("latitude", "40.7128")
      .field("longitude", "-74.0060")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body.isValidated).toBe(false);
  });
});

describe("GET /posts", function () {
  it("should retrieve the list of posts", async function () {
    const res = await supertest(app)
      .get("/api/v1/posts")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toBeInstanceOf(Array);
  });

  it("should retrieve a post by ID", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    const res = await supertest(app)
      .get(`/api/v1/posts/${postId}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("latitude");
    expect(res.body).toHaveProperty("longitude");
    expect(res.body).toHaveProperty("isValidated");
  });
});

describe("PATCH /posts/:id", function () {
  it("should update a post properties", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    const res = await supertest(app)
      .patch(`/api/v1/posts/${postId}`)
      .send({ isValidated: true, latitude: 40.7128, longitude: -74.006 })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body.isValidated).toBe(true);
    expect(res.body.latitude).toBe(40.7128);
    expect(res.body.longitude).toBe(-74.006);
  });
});

describe("DELETE /posts/:id", function () {
  it("should delete a post by ID", async function () {
    const createRes = await supertest(app)
      .post("/api/v1/posts")
      .field("latitude", "51.5074")
      .field("longitude", "-0.1278")
      .attach("picture", "./src/spec/fixtures/post_test_image.jpg")
      .expect(201)
      .expect("Content-Type", /json/);

    const postId = createRes.body._id;

    await supertest(app).delete(`/api/v1/posts/${postId}`).expect(204);

    await supertest(app).get(`/api/v1/posts/${postId}`).expect(404);
  });
});
