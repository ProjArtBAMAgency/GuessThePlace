import supertest from "supertest"
import app from "../app.js"
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Team from "../models/Teams.js";
import "dotenv/config";
import generateValidJwt from "./utils.js";

let jwtToken = null;
let userId;

beforeAll(async () => {
    await connectDB();
    
    // Clean up any existing test data
    await User.deleteMany({ email: 'scoreuser@test.com'});
    await Team.deleteMany({ name: 'Test Team Score' });
    
    // Create a team for testing
    const team = await Team.create({
        name: 'Test Team Score',
        color: 'purple',
    });
    const teamId = team._id;
    
    // Create a user for tests
    const user = await User.create({
        pseudo: 'userscore',
        email: 'scoreuser@test.com',
        password_hash: 'hashedpassword',
        is_admin: false,
        team_id: teamId,
    });
    userId = user._id;
    jwtToken = await generateValidJwt({ _id: userId, is_admin: false });
});

describe('GET /api/v1/user-scores/:id', function () {
    it("should retrieve the user posts score", async function () {
        const res = await supertest(app)
            .get('/api/v1/user-scores/' + userId)
            .set('Cookie', [`token=${jwtToken}`])
            .expect(200)
            .expect('Content-Type', /json/)
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('postsCount');
        expect(res.body).toHaveProperty('postsScore');
    });
});

afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'scoreuser@test.com'});
    await Team.deleteMany({ name: 'Test Team Score' });
});