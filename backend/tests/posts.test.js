const mongoose = require("mongoose");
const supertest = require("supertest");
const { app } = require("../src/server");
const { createPost1, createPost2 } = require("./createPosts");
const User = require("../src/models/user.model");
const { Schema } = require("mongoose");
const Post = require("../src/models/post.model");
const { connect } = require("../src/utils/dbConnection");
const { getUserHeader, createUser, createUser2 } = require("./authHeader");
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
  test("a non-logged in user can't get a list of a posts from any users in the system", async () => {
    let user = await createUser();
    let jwt = await getUserHeader();
    await createPost1(user);
    await createPost2(user);
    const res = await request.get(`/api/users/${user._id}/posts`);

    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
});
describe("GET /users/:userId/posts/:postId", () => {
  test("a logged in user can get a a posts by id", async () => {
    let user = await createUser();
    let jwt = await getUserHeader();
    const post1 = await createPost1(user);
    await createPost2(user);

    const res = await request
      .get(`/api/users/${user._id}/posts/${post1._id}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual(post1.text);
  });
  test("an unauthenticated user can't get a a posts by id", async () => {
    let user = await createUser();
    const post1 = await createPost1(user);
    await createPost2(user);

    const res = await request.get(`/api/users/${user._id}/posts/${post1._id}`);

    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
  test("an unauthenticated user can't create a posts that doesn't exist", async () => {
    let user = await createUser();
    let user2 = await createUser2();
    await createPost1(user);
    const anotherUserPost = await createPost2(user2);
    let jwt = await getUserHeader();

    const res = await request.get(
      `/api/users/${user2._id}/posts/${anotherUserPost._id}`
    );

    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
});
describe("POST /users/:userId/posts", () => {
  test("authorized users can create a post", async () => {
    const newUser = await createUser();

    const header = await getUserHeader();
    console.log(newUser);
    const res = await request
      .post(`/api/users/${newUser._id}/posts`)
      .set("Authorization", `Bearer ${header}`)
      .set({ connection: "keep-alive" })
      .attach("image", `${__dirname}/image.jpg`)
      .field("text", "Hello world");

    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual("Hello world");
    expect(res.body.image).toBeUndefined();
  });
});
