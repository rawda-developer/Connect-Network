const { app } = require("../src/server");
const supertest = require("supertest");
const mongoose = require("mongoose");

const User = require("../src/models/user.model");
const { connect } = require("../src/utils/dbConnection");
const {
  user,
  createUser,
  getUserHeader,
  createUser2,
  getUser2Header,
} = require("./authHeader");
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
  test("should not update unauthenticated user", async () => {
    const newUser = await createUser();
    const res = await request
      .put(`/api/users/${newUser._id}`)
      .set({ connection: "keep-alive" })
      .attach("image", `${__dirname}/image.jpg`)
      .field("name", "Test updated")
      .field("password", "testTest123*&_new")
      .field("email", "test_updated@test.com");

    expect(res.status).toEqual(401);
    expect(res.body.name).toBeUndefined();
    expect(res.body.hashedPassword).toBeUndefined();
    expect(res.body.image).toBeUndefined();
  });
  test("should not update unauthorized user", async () => {
    const newUser = await createUser();
    const user2 = await createUser2();

    const user2header = await getUser2Header();
    const res = await request
      .put(`/api/users/${newUser._id}`)
      .set("Authorization", `Bearer ${user2header}`)
      .set({ connection: "keep-alive" })
      .attach("image", `${__dirname}/image.jpg`)
      .field("name", "Test updated")
      .field("password", "testTest123*&_new")
      .field("email", "test_updated2@test.com");
    expect(res.status).toEqual(403);
    expect(res.body.name).toBeUndefined();
    expect(res.body.hashedPassword).toBeUndefined();
    expect(res.body.image).toBeUndefined();
  });
});
describe("DELETE /api/users/:userId", () => {
  test("authorized user can delete her own account", async () => {
    const newUser = await createUser();
    const jwt = await getUserHeader();
    const res = await request
      .delete(`/api/users/${newUser._id}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("User deleted successfully");
    const deletedUser = await User.findOne({ _id: newUser._id });
    expect(deletedUser).toBeNull();
  });
  test("unauthorized user can't delete account", async () => {
    const newUser = await createUser();
    await createUser2();
    const anotherUserJwt = await getUser2Header();
    const res = await request
      .delete(`/api/users/${newUser._id}`)
      .set("Authorization", `Bearer ${anotherUserJwt}`);
    expect(res.statusCode).toEqual(403);
    const deletedUser = await User.findById(newUser._id);
    expect(deletedUser).toBeDefined();
  });
  test("unauthenticated user can't delete an account", async () => {
    const newUser = await createUser();
    await createUser2();
    const res = await request.delete(`/api/users/${newUser._id}`);
    expect(res.statusCode).toEqual(401);
    const deletedUser = await User.findById(newUser._id);
    expect(deletedUser).toBeDefined();
  });
});
describe("GET /api/users", () => {
  test("a logged-in user can get a list of user profiles in the system", async () => {
    const newUser1 = await createUser();
    const newUser2 = await createUser2();
    const user1Jwt = await getUserHeader();

    const res = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${user1Jwt}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });
  test("a non logged-in user can't get a list of user profiles in the system", async () => {
    await createUser();
    await createUser2();
    const res = await request.get("/api/users");
    expect(res.statusCode).toBe(401);
  });
});
describe("/api/users/:userId/followed/by/followerId", () => {
  test("authenticated users can follow another user", async () => {
    const newUser1 = await createUser();
    const newUser2 = await createUser2();
    const user1Jwt = await getUserHeader();
    const res = await request
      .post(`/api/users/${newUser2._id}/followed/by/${newUser1._id}`)
      .set("Authorization", `Bearer ${user1Jwt}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBeTruthy();
    const result = await User.findOne({ _id: newUser2._id }).select(
      "followers"
    );
    expect(result.followers).toContainEqual(newUser1._id);
  });
  test("unauthenticated users can follow another user", async () => {
    const newUser1 = await createUser();
    const newUser2 = await createUser2();
    const user1Jwt = await getUserHeader();
    const res = await request.post(
      `/api/users/${newUser2._id}/followed/by/${newUser1._id}`
    );

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
});
