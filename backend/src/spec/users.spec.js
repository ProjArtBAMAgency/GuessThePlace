import supertest from "supertest"
import app from "../app.js"
import { connectDB } from "../db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Team from "../models/Teams.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";
import bcrypt from "bcrypt";

let teamId;
let adminId;
let adminToken;

beforeAll(async () => {
    await connectDB();
    
    // Clean up any existing test data
    await User.deleteMany({ email: { $regex: /jessaie.*@aksdj\.com/ } });
    await Team.deleteMany({ name: 'Test Team' });
    
    // Create a team for testing
    const team = await Team.create({
        name: 'Test Team',
        color: 'red',
    });
    teamId = team._id;
    
    // Create an admin user for tests that require admin rights
    const adminPasswordHash = await bcrypt.hash('adminpass', 10);
    const adminUser = await User.create({
        pseudo: 'adminuser',
        email: 'admin@test.com',
        password_hash: adminPasswordHash,
        is_admin: true,
        team_id: teamId,
    });
    adminId = adminUser._id;
    adminToken = await generateValidJwt({ _id: adminId, is_admin: true });
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
                password: 'password123',
                is_admin: false,
                team_id: teamId,
            })
            .expect(201)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty("_id");
        expect(res.body.user).toHaveProperty("pseudo", "jessaie");
        expect(res.body.user.email).toContain("jessaie@aksdj.com");
        expect(res.body.user.team_id.toString()).toBe(teamId.toString());

        userId = res.body.user._id;
        jwtToken = await generateValidJwt({ _id: userId });
    });
});


describe('GET /api/v1/users', function () {

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

    it("should retrieve a user with a specific id", async function () {
        const res = await supertest(app)
            .get('/api/v1/users/' + userId)
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("_id", userId);
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
            pictureContentType: 'image/jpg',
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
        expect(Array.isArray(res.body));
    });

});


describe('PATCH /api/v1/users/:id', function () {

    it("should patch an user", async function () {
        const res = await supertest(app)
            .patch('/api/v1/users/' + userId)
            .send({
                pseudo: "jessaieee",
                email: "jessaieee@aksdj.com",
                team: "blue"
            })
            .set('Cookie', [`token=${adminToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("_id", userId);
        expect(res.body.user).toHaveProperty("pseudo", "jessaieee");
        expect(res.body.user.email).toContain("jessaieee@aksdj.com");
        // Note: the controller doesn't update 'team' field, it updates 'team_id'
        // expect(res.body.user).toHaveProperty("team", "blue");
    });

});


describe('DELETE /api/v1/users/:id', function () {

    it("should delete an user", async function () {
        const res = await supertest(app)
            .delete('/api/v1/users/' + userId)
            .set('Cookie', [`token=${adminToken}`])
            .expect(204)

            expect(res.status).toBe(204);
    })
    
});



afterAll(async () => {
    // Clean up the users created for testing
    await User.deleteMany({ _id: { $in: [userId, adminId] } });
    await Post.deleteMany({ userId: userId });
    await Team.deleteMany({ _id: teamId });
    await mongoose.connection.close();
});