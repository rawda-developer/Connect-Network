const { app } = require("../src/server");
const supertest = require("supertest");
const mongoose = require("mongoose");

const User = require("../src/models/user.model");
const { connect } = require("../src/utils/dbConnection");
const { user, createUser, getUserHeader } = require("./authHeader");
const request = supertest(app);
beforeAll(async () => {
  await connect();
});
afterAll(async () => {
  await mongoose.connection.close();
});
afterEach(async () => {
  await User.deleteMany({});
});
describe("POST /api/users", () => {
  it("should register a user", async () => {
    const res = await request.post("/api/users/").send({
      name: "Test",
      email: "test123@test.com",
      password: "testTest123*&",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successfully signed up!");
  });
  test("should not register a user with an existing email", async () => {
    const user = new User({
      name: "Test",
      email: "test123@test.com",
      password: "testTest123*&",
    });
    await user.save();
    const res = await request.post("/api/users/").send({
      name: "Test",
      email: "test123@test.com",
      password: "testTest123*&",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exists");
  });
  test("should not register a user with an invalid email", async () => {
    const res = await request.post("/api/users/").send({
      name: "Test",
      email: "test123test.com",
      password: "testTest123*&",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email");
  });
});
describe("POST /api/auth/login", () => {
  test("should login a user", async () => {
    await createUser();
    const res = await request.post("/api/auth/login").send({
      email: "test1@test.com",
      password: "testTest123*&",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
  test("should not login a user with invalid credentials", async () => {
    await createUser();
    const res = await request.post("/api/auth/login").send({
      email: "test1@test.com",
      password: "wrongPassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Email and password don't match.");
  });
});
