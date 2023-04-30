const Post = require("../models/post.model");
const extend = require("lodash/extend");
const formidable = require("formidable");
const fs = require("fs");
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
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Post Image could not be uploaded",
      });
    }
    let post = new Post({ text: fields.text });
    post.updated = Date.now();
    if (files.image) {
      post.image.data = fs.readFileSync(files.image.filepath);
      post.image.contentType = files.image.type;
    }
    try {
      await post.save();
      post.image = undefined;
      return res.json(post);
    } catch (err) {
      return res.json({ error: "Sorry we can't create the post right now" });
    }
  });
};
const edit = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Post Image could not be uploaded",
      });
    }
    let post = req.post;
    post = extend(post, fields);
    post.updated = Date.now();
    if (files.image) {
      post.image.data = fs.readFileSync(files.image.filepath);
      post.image.contentType = files.image.type;
    }
    try {
      await post.save();

      post.image = undefined;
      return res.json(post);
    } catch (err) {
      return res.status(400).json({
        error: "Sorry there's something wrong",
      });
    }
  });
};
const remove = async (req, res) => {
  try {
    const deletedPost = req.post;
    await Post.findByIdAndDelete(deletedPost._id);
    return res.json(deletedPost);
  } catch (err) {
    return res.status(400).json({ error: "Sorry something went wrong" });
  }
};
module.exports = { readAll, postById, read, create, edit, remove };
