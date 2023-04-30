const express = require("express");
const {
  requireLogin,
  hasAuthorization,
} = require("../controllers/auth.controller");
const { readAll, read, postById } = require("../controllers/post.controller");
const { userById } = require("../controllers/user.controller");

const postRouter = express.Router();
postRouter.route("/users/:userId/posts").get(requireLogin, readAll);
postRouter.route("/users/:userId/posts/:postId").get(requireLogin, read);

postRouter.param("userId", userById);
postRouter.param("postId", postById);
module.exports = postRouter;
