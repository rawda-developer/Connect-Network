const { app } = require("../server");
const request = require("supertest");
describe("dummy test", () => {
  test("GET /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({message: "Hello world"});
  });
});
