const express = require("express");
const {
  requireLogin,
  hasAuthorization,
} = require("../controllers/auth.controller");
const {
  readAll,
  read,
  create,
  postById,
  edit,
  remove,
  addComment,
} = require("../controllers/post.controller");
const { userById } = require("../controllers/user.controller");

const postRouter = express.Router();
postRouter
  .route("/users/:userId/posts/:postId/comments")
  .post(requireLogin, addComment);
postRouter
  .route("/users/:userId/posts")
  .get(requireLogin, readAll)
  .post(requireLogin, hasAuthorization, create);
postRouter
  .route("/users/:userId/posts/:postId")
  .get(requireLogin, read)
  .put(requireLogin, hasAuthorization, edit)
  .delete(requireLogin, hasAuthorization, remove);
postRouter.param("userId", userById);
postRouter.param("postId", postById);
module.exports = postRouter;
