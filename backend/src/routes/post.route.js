const express = require("express");
const {
  requireLogin,
  hasAuthorization,
} = require("../controllers/auth.controller");
const {
  isCommentOwner,
  readAll,
  read,
  create,
  postById,
  edit,
  remove,
  addComment,
  updateComment,
  commentById,
  readComment,
  deleteComment,
} = require("../controllers/post.controller");
const { userById } = require("../controllers/user.controller");

const postRouter = express.Router();
postRouter
  .route("/users/:userId/posts/:postId/comments/:commentId")
  .get(requireLogin, readComment)
  .put(requireLogin, isCommentOwner, updateComment)
  .delete(requireLogin, isCommentOwner, deleteComment);
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
postRouter.param("commentId", commentById);
module.exports = postRouter;
