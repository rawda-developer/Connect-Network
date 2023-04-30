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
  const post = await Post.findOne({ _id: postId, owner: req.user })
    .populate("owner", "_id name")
    .populate("comments", "_id text")
    .populate("likes", "_id name")
    .exec();
  console.log("POSTBYID", post);
  if (!post)
    return res.status(404).json({ error: "Sorry we can't find that post" });
  post.image = undefined;
  req.post = post;
  next();
};
const create = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    newPost.owner = req.user;
    await newPost.save();
    const result = await Post.findOne({ _id: newPost._id })
      .populate("owner", "_id name")
      .exec();

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: "Sorry can't create post" });
  }
};
module.exports = { readAll, postById, read, create };
