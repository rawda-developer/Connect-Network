const express = require("express");
const {
  requireLogin,
  hasAuthorization,
} = require("../controllers/auth.controller");
const { readAll } = require("../controllers/post.controller");
const { userById } = require("../controllers/user.controller");

const postRouter = express.Router();
postRouter.route("/users/:userId/posts").get(requireLogin, readAll);

postRouter.param("userId", userById);
module.exports = postRouter;
