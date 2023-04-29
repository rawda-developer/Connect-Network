const mongoose = require("mongoose");
const supertest = require("supertest");
const { app } = require("../src/server");
const { createPost1, createPost2 } = require("./createPosts");
const User = require("../src/models/user.model");

const Post = require("../src/models/post.model");
const { connect } = require("../src/utils/dbConnection");
const { getUserHeader, createUser } = require("./authHeader");
const request = supertest(app);
beforeAll(async () => {
  await connect();
});
afterAll(async () => {
  await mongoose.connection.close();
});
afterEach(async () => {
  await Post.deleteMany({});
  await User.deleteMany({});
});
describe("GET /users/:userId/posts", () => {
  test("a logged in user can get a list of a posts from any users in the system", async () => {
    let user = await createUser();
    let jwt = await getUserHeader();
    await createPost1(user);
    await createPost2(user);
    const res = await request
      .get(`/api/users/${user._id}/posts`)
      .set("Authorization", `Bearer ${jwt}`);
    expect(res.status).toEqual(200);
    expect(res.body).toHaveLength(2);
  });
  test("a logged in user can get a list of a posts from any users in the system", async () => {
    let user = await createUser();
    let jwt = await getUserHeader();
    await createPost1(user);
    await createPost2(user);
    const res = await request
      .get(`/api/users/${user._id}/posts`)
     
    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy()
  });
});
