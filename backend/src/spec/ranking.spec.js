import supertest from "supertest"
import app from "../app.js"
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Team from "../models/Teams.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";

let jwtToken = null;

beforeAll(async () => {
    await connectDB();
    
    // Clean up any existing test data
    await User.deleteMany({ email: { $regex: /rankinguser.*@test\.com/ } });
    await Team.deleteMany({ name: 'Test Team Ranking' });
    
    // Create a team for testing
    const team = await Team.create({
        name: 'Test Team Ranking',
        color: 'yellow',
    });
    const teamId = team._id;
    
    // Create a user for tests
    const user = await User.create({
        pseudo: 'useranking',
        email: 'rankinguser@test.com',
        password_hash: 'hashedpassword',
        is_admin: false,
        team_id: teamId,
    });
    const userId = user._id;
    jwtToken = await generateValidJwt({ _id: userId, is_admin: false });
});


describe('GET /api/v1/ranking', function () {
    it("should retrieve the user ranking", async function () {
        const res = await supertest(app)
            .get('/api/v1/ranking')
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toHaveProperty('page');
        expect(res.body.pagination).toHaveProperty('limit');
        expect(res.body.pagination).toHaveProperty('total');
        expect(res.body.pagination).toHaveProperty('totalPages');
    });
});