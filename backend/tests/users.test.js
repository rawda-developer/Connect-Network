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
describe("GET /api/users/:userId", () => {
  test("should get user by id", async () => {
    const newUser = await createUser();

    const header = await getUserHeader();

    const res = await request
      .get(`/api/users/${newUser._id}`)
      .set("Authorization", `Bearer ${header}`);

    expect(res.status).toEqual(200);
    expect(res.body.name).toEqual("Test");

    expect(res.body.hashedPassword).toBeUndefined();
  });
  test("shouldn't get user by id not logged in", async () => {
    const newUser = await createUser();

    const res = await request.get(`/api/users/${newUser._id}`);

    expect(res.status).toEqual(401);
  });
});
describe("PUT /api/users/:userId", () => {
  test("should update user by id", async () => {
    const newUser = await createUser();

    const header = await getUserHeader();

    const res = await request
      .put(`/api/users/${newUser._id}`)
      .set("Authorization", `Bearer ${header}`)
      .set({ connection: "keep-alive" })
      .attach("image", `${__dirname}/image.jpg`)
      .field("name", "Test updated")
      .field("password", "testTest123*&_new")
      .field("email", "test_updated@test.com");

    expect(res.status).toEqual(200);
    expect(res.body.name).toEqual("Test updated");
    expect(res.body.hashedPassword).toBeUndefined();
    expect(res.body.image).toBeUndefined();
  });
});
