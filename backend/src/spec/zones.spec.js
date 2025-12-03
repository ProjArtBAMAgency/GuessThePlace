import supertest from 'supertest';
import app from '../app.js';
import Zones from '../models/Zones.js';



describe('GET /zones',  ()=>{
    it("should retrieve all the zones", async () =>{
        // const findSpy = jest.spyOn(Zones, "find").mockResolvedValueOnce([]);
        const res = await supertest(app).get('/api/v1/zones');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(0);
    });
});

// describe('GET /zones/:id', ()=>{
//     it("should retrieve a zone by its ID", async ()=>{
//         const res = await request(app).get('/api/v1/zones/1')
//         expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty("error", "ID invalide");
//     });
// });

// describe('GET /zones/map', () => {
//   it("should retrieve zones GeoJSON data for the map", async () => {
//     const res = await request(app).get("/api/v1/zones/map");

//     expect(res.statusCode).toBe(200);

//     // On vérifie la structure générale du GeoJSON
//     expect(res.body).toHaveProperty("type");
//     expect(res.body.type).toBe("FeatureCollection");

//     expect(res.body).toHaveProperty("features");
//     expect(Array.isArray(res.body.features)).toBe(true);
//   });
// }); 