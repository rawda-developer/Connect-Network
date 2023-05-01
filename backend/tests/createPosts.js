const Post = require("../src/models/post.model");

let post1, post2, comment1, comment2;
const createPost1 = async (user) => {
  post1 = new Post({
    text: "Hello world",
    owner: user._id,
  });
  await post1.save();
  return await Post.findOne({ _id: post1._id });
};
const createPost2 = async (user) => {
  post2 = new Post({
    text: "Hello world Post 2",
    owner: user._id,
  });
  await post2.save();
  return post2;
};
module.exports = { createPost1, createPost2 };
