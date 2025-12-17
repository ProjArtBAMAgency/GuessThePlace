import supertest from "supertest"
import app from "../app.js"
import { connectDB } from "../db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";

beforeAll(async () => {
    await connectDB();
});

let userId;
let jwtToken;

describe('POST /api/v1/users', function () {
    it("should create a new user", async function () {
        const res = await supertest(app)
            .post('/api/v1/users')
            .send({
                pseudo: 'jessaie',
                email: `jessaie@aksdj.com`,
                password_hash: 'password123',
                is_admin: false,
                team: 'red',
            })
            .expect(201)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("pseudo", "jessaie");
        expect(res.body.email).toContain("jessaie@aksdj.com");
        expect(res.body).toHaveProperty("team", "red");

        userId = res.body._id;
        jwtToken = await generateValidJwt({ _id: userId });
    });
});


describe('GET /api/v1/users', function () {

    beforeAll(async () => {
        await User.create({
            pseudo: 'oupsii',
            email: 'oupsii@aksdj.com',
            password_hash: 'password123',
            is_admin: false,
            team: 'blue',
        });
    }
    );

    it("should retrieve all users", async function () {
        const res = await supertest(app)
            .get('/api/v1/users')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});


describe('GET /api/v1/users/:id', function () {
            
    it("should retrieve the users posts", async function () {
        const res = await supertest(app)
            .get('/api/v1/users/' + userId)
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("_id", userId);
    });

});


describe('GET /api/v1/users/:id/posts', function () {

    beforeAll(async () => {
        // Ensure there's a post to retrieve
        await Post.create({
            latitude: "46.2044",
            longitude: "6.1432",  
            isValidated: true,
            picture: Buffer.from("./src/spec/fixtures/post_test_image.jpg"),
            pictureContentType: 'image/png',
            pictureSize: 0,
            userId: userId,
        });
        }
    );

    it("should retrieve posts of a specific user", async function () {
        const res = await supertest(app)
            .get('/api/v1/users/' + userId + '/posts')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});




afterAll(async () => {
    // Clean up the users created for testing
    await User.deleteMany({ pseudo: { $in: ['jessaie', 'oupsii'] } });
    await Post.deleteMany({ userId: userId });
    await mongoose.connection.close();
});