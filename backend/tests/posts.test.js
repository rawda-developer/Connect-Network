const mongoose = require("mongoose");
const supertest = require("supertest");
const { app } = require("../src/server");
const { createPost1, createPost2 } = require("./createPosts");
const User = require("../src/models/user.model");
const Comment = require("../src/models/comment.model");
const Post = require("../src/models/post.model");
const { Schema } = require("mongoose");
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
  await Comment.deleteMany({});
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
describe("PUT /users/:userId/posts", () => {
  test("authorized users can create a post", async () => {
    const newUser = await createUser();
    const newPost = await createPost1(newUser);
    const header = await getUserHeader();

    const res = await request
      .put(`/api/users/${newUser._id}/posts/${newPost._id}`)
      .set("Authorization", `Bearer ${header}`)
      .set({ connection: "keep-alive" })
      .attach("image", `${__dirname}/image.jpg`)
      .field("text", "Hello world");

    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual("Hello world");
    expect(res.body.image).toBeUndefined();
  });
});
describe("DELETE /api/users/:userId/posts/:postId", () => {
  test("authorized user can delete their posts", async () => {
    const newUser = await createUser();
    const newPost = await createPost1(newUser);
    const header = await getUserHeader();

    const res = await request
      .delete(`/api/users/${newUser._id}/posts/${newPost._id}`)
      .set("Authorization", `Bearer ${header}`);
    expect(res.status).toEqual(200);
    expect(res.body._id).toEqual(newPost._id.toString());
  });
});
describe("POST /api/users/:userId/posts/:postId/comment", () => {
  test("authenticated users can create comments on posts", async () => {
    const newUser = await createUser();
    const newPost = await createPost1(newUser);
    const header = await getUserHeader();

    const res = await request
      .post(`/api/users/${newUser._id}/posts/${newPost._id}/comments`)
      .set("Authorization", `Bearer ${header}`)
      .send({ text: "Hey everyone" });
    expect(res.status).toEqual(200);
    console.log(res.body.comments);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].text).toEqual("Hey everyone");
  });
  test("unauthenticated users can't create comments on posts", async () => {
    const newUser = await createUser();
    const newPost = await createPost1(newUser);

    const res = await request
      .post(`/api/users/${newUser._id}/posts/${newPost._id}/comments`)
      .send({ text: "Hey everyone" });
    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
  test("authenticated users can't create comments on non-existing posts", async () => {
    const newUser = await createUser();
    const newUser2 = await createUser2();
    const newPost = await createPost1(newUser);
    const header = await getUserHeader();

    const res = await request
      .post(`/api/users/${newUser2._id}/posts/${newPost._id}/comments`)
      .set("Authorization", `Bearer ${header}`)
      .send({ text: "Hey everyone" });
    expect(res.status).toEqual(404);
    expect(res.body.error).toBeTruthy();
  });
});
describe("PUT /api/users/:userId/posts/:postId/comment/:commentId", () => {
  test("authenticated users can update their comments on a post", async () => {
    let newUser = await createUser();
    const newPost = await createPost1(newUser);
    const jwt = await getUserHeader();
    let newComment = new Comment({
      text: "hello",
      owner: newUser,
      post: newPost,
    });
    newComment = await newComment.save();

    await Post.findByIdAndUpdate(newPost._id, {
      $push: {
        comments: newComment,
      },
      $set: {
        owner: newUser,
      },
    })
      .populate("owner", "_id name")
      .exec();
    newUser = await User.findOneAndUpdate(
      { _id: newUser._id },
      {
        $push: {
          posts: newPost,
        },
      }
    ).populate("posts.owner", "_id text");

    const res = await request
      .put(
        `/api/users/${newUser._id}/posts/${newPost._id}/comments/${newComment._id}`
      )
      .set("Authorization", `Bearer ${jwt}`)
      .send({ text: "Hey everyone!!" });
    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual("Hey everyone!!");
  });
  test("authenticated users can update their comments on a post", async () => {
    let newUser = await createUser();
    let newUser2 = await createUser2();
    const newPost = await createPost1(newUser);
    const jwt = await getUserHeader();
    let newComment = new Comment({
      text: "hello",
      owner: newUser2,
      post: newPost,
    });
    newComment = await newComment.save();

    await Post.findByIdAndUpdate(newPost._id, {
      $push: {
        comments: newComment,
      },
      $set: {
        owner: newUser2,
      },
    })
      .populate("owner", "_id name")
      .exec();
    newUser = await User.findOneAndUpdate(
      { _id: newUser._id },
      {
        $push: {
          posts: newPost,
        },
      }
    ).populate("posts.owner", "_id text");

    const res = await request
      .put(
        `/api/users/${newUser2._id}/posts/${newPost._id}/comments/${newComment._id}`
      )
      .set("Authorization", `Bearer ${jwt}`)
      .send({ text: "Hey everyone!!" });
    expect(res.status).toEqual(403);
    // console.log("UNAUTHRIZED", res.body);
    expect(res.body.error).toBeTruthy();
  });
});
describe("GET /api/users/:userId/posts/:postId/comment/:commentId", () => {
  test("authenticated users can view comments on a post", async () => {
    const newUser = await createUser();
    const post1 = await createPost1(newUser);
    const jwt = await getUserHeader();
    let comment = new Comment({ text: "Text 1", owner: newUser });
    comment = await comment.save();
    const res = await request
      .get(
        `/api/users/${newUser._id}/posts/${post1._id}/comments/${comment._id}`
      )
      .set("Authorization", `Bearer ${jwt}`);
    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual("Text 1");
  });
  test("unauthenticated users can't their comments on a post", async () => {
    const newUser = await createUser();
    const post1 = await createPost1(newUser);

    let comment = new Comment({ text: "Text 1", owner: newUser });
    comment = await comment.save();
    const res = await request.get(
      `/api/users/${newUser._id}/posts/${post1._id}/comments/${comment._id}`
    );

    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
});
describe("DELETE /api/users/:userId/posts/:postId/comment/:commentId", () => {
  test("authorized users can delete their comments on a post", async () => {
    const newUser = await createUser();
    const newPost = await createPost1(newUser);
    const jwt = await getUserHeader();
    let comment = new Comment({
      text: "Hello",
      owner: newUser._id,
      post: newPost._id,
    });
    comment = await comment.save();
    comment = await Comment.findOne({ _id: comment._id })
      .populate("owner", "_id name")
      .populate("post", "_id text")
      .exec();

    const result = await Post.findByIdAndUpdate(
      newPost._id,
      {
        $push: { comments: comment },
      },
      { new: true }
    )
      .populate("comments", "_id text")
      .exec();

    const res = await request
      .delete(
        `/api/users/${newUser._id}/posts/${newPost._id}/comments/${comment._id}`
      )
      .set("Authorization", `Bearer ${jwt}`);
    console.log("BODY", res.body);
    expect(res.status).toEqual(200);
    expect(res.body.text).toEqual("Hello");
  });
  test("unauthorized users can't delete other users comments on a post", async () => {
    const newUser = await createUser();
    const post1 = await createPost1(newUser);

    let comment = new Comment({ text: "Text 1", owner: newUser });
    comment = await comment.save();
    const res = await request.delete(
      `/api/users/${newUser._id}/posts/${post1._id}/comments/${comment._id}`
    );

    expect(res.status).toEqual(401);
    expect(res.body.error).toBeTruthy();
  });
});
