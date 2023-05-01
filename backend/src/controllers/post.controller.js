const Post = require("../models/post.model");
const extend = require("lodash/extend");
const formidable = require("formidable");
const fs = require("fs");
const Comment = require("../models/comment.model");
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
      return res
        .status(400)
        .json({ error: "Sorry we can't create the post right now" });
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
const addComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    const result = await Post.findByIdAndUpdate(
      req.post._id,
      {
        $push: { comments: comment },
      },
      { new: true }
    )
      .select("comments")
      .populate("comments.owner", "_id name")
      .populate("comments", "_id text")
      .exec();

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: "Sorry we can't create comment" });
  }
};
const isCommentOwner = async (req, res, next) => {
  console.log("COMMENT", req.comment);
  console.log("AUTH", req.auth);
  console.log("user", req.user);
  if (
    req.comment &&
    req.comment.owner &&
    req.auth &&
    req.comment.owner._id == req.auth._id
  ) {
    next();
  } else res.status(403).json({ error: "Sorry we can't update this comment" });
};
const updateComment = async (req, res) => {
  try {
    const result = await Comment.findByIdAndUpdate(req.comment._id, req.body, {
      new: true,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Sorry we can't update this comment right now" });
  }
};
const commentById = async (req, res, next, commentId) => {
  try {
    const comment = await Comment.findById(commentId)
      .populate("owner", "_id name")
      .populate("post", "_id text")
      .exec();
    if (!comment) {
      return res
        .status(404)
        .json({ error: "Sorry we can't find the given comment" });
    }
    req.comment = comment;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Sorry something wrong happened" });
  }
};
const readComment = async (req, res) => {
  return res.json(req.comment);
};
const deleteComment = async (req, res) => {
  try {
    const deletedComment = await Comment.findOne({
      _id: req.params.commentId,
    });

    const result1 = await Post.findByIdAndUpdate(
      req.post._id,
      {
        $pull: { comments: deletedComment._id },
      },
      { new: true }
    );
    console.log("result1", result1);
    await Comment.findByIdAndDelete(deletedComment._id);

    return res.json(deletedComment);
  } catch (err) {
    return res.status(400).json({ error: "Sorry something gone wrong" });
  }
};
module.exports = {
  readAll,
  postById,
  commentById,
  read,
  create,
  edit,
  remove,
  addComment,
  updateComment,
  isCommentOwner,
  readComment,
  deleteComment,
};
