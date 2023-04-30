const Post = require("../models/post.model");

const readAll = async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.user._id });
    return res.json(posts);
  } catch (err) {
    res.status(400).json({ error: "sorry we can't get posts" });
  }
};
const read = async (req, res) => {
  return res.json(req.post);
};
const postById = async (req, res, next, postId) => {
  const post = await Post.findById(postId)
    .populate("owner", "_id name")
    .populate("comments", "_id text")
    .populate("likes", "_id name");
  post.image = undefined;
  req.post = post;
  console.log(post);
  if (!post)
    return res.status(404).json({ error: "Sorry we can't find that post" });
  next();
};
module.exports = { readAll, postById, read };
