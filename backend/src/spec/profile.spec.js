import supertest from "supertest"
import app from "../app.js"
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Team from "../models/Teams.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";
import bcrypt from "bcrypt";

let teamId;

beforeAll(async () => {
    await connectDB();
    
    // Clean up any existing test data
    await User.deleteMany({ email: { $regex: /userys@test.com/ } });
    await Team.deleteMany({ name: 'Test Team Profile' });
    
    // Create a team for testing
    const team = await Team.create({
        name: 'Test Team Profile',
        color: 'green',
    });
    teamId = team._id;
    
    // Create a user for tests
    const passwordHash = await bcrypt.hash('Password!123', 10);
    const user = await User.create({
        pseudo: 'userys',
        email: 'userys@test.com',
        password_hash: passwordHash,
        is_admin: false,
        team_id: teamId,
    });
    userId = user._id;
    jwtToken = await generateValidJwt({ _id: userId, is_admin: false });
});

let userId;
let jwtToken;

describe('GET /api/v1/profile/me', function () {
    it("should retrieve the user profile", async function () {
        const res = await supertest(app)
            .get('/api/v1/profile/me')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('email', 'userys@test.com');
        expect(res.body).toHaveProperty('pseudo', 'userys');
        expect(res.body).toHaveProperty('is_admin', false);
        expect(res.body).toHaveProperty('team_id');
        expect(res.body.team_id).toHaveProperty('_id', teamId.toString());
    });
});

describe('GET /api/v1/profile/me/statistics', function () {
    it("should retrieve the user statistics", async function () {
        const res = await supertest(app)
            .get('/api/v1/profile/me/statistics')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('team');
        expect(res.body).toHaveProperty('totalPosts');
        expect(res.body).toHaveProperty('totalGuesses');
        expect(res.body).toHaveProperty('totalScore');
    }
);
});

describe('PATCH /api/v1/profile/me', function () {
    it("should update the user profile", async function () {
        const res = await supertest(app)
            .patch('/api/v1/profile/me')
            .set('Cookie', [`token=${jwtToken}`])
            .send({
                email: 'aaaa@test.com',
                pseudo: 'aaaaa3423!'
            })
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);

        });
});


describe('PATCH /api/v1/profile/me/change-password', function () {
    it("should change the user password", async function () {
        const res = await supertest(app)
            .patch('/api/v1/profile/me/change-password')
            .set('Cookie', [`token=${jwtToken}`])
            .send({
                currentPassword: 'Password!123',
                newPassword: 'NewPassword!456'
            })
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });
});

describe('GET /api/v1/profile/me/available-posts', function () {
    it("should retrieve available posts for the user", async function () {
        const res = await supertest(app)
            .get('/api/v1/profile/me/available-posts')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body));
    });
});


describe("DELETE /api/v1/profile/me/posts/:postId", function () {
    it("should delete a post of the user", async function () {
        // First, create a post to delete
        const postRes = await supertest(app)
            .post('/api/v1/posts')
            .set('Cookie', [`token=${jwtToken}`])
            .field('latitude', 46.5191)
            .field('longitude', 6.5668)
            .attach('picture', './src/spec/fixtures/post_test_image.jpg')
            .expect(201);
            
        const postId = postRes.body._id;

        // Now, delete the created post
        const res = await supertest(app)
            .delete(`/api/v1/profile/me/posts/${postId}`)
            .set('Cookie', [`token=${jwtToken}`])
            .expect(204)
            
        expect(res.status).toBe(204);
    });
});

describe('DELETE /api/v1/profile/me', function () {
    it("should delete the user profile", async function () {
        const res = await supertest(app)
            .delete('/api/v1/profile/me')
            .set('Cookie', [`token=${jwtToken}`])
            .send({ password: 'NewPassword!456' })
            .expect(204)
        expect(res.status).toBe(204);
    });
});


afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['userys@test.com', 'aaaa@test.com'] } });
    await Team.deleteMany({ name: 'Test Team Profile' });
});