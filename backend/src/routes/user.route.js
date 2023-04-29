const express = require("express");
const {
  requireLogin,
  hasAuthorization,
} = require("../controllers/auth.controller");
const {
  create,
  passwordComplexity,
  userById,
  read,
  readAll,
  update,
  remove,
  follow,
  unfollow,
} = require("../controllers/user.controller");

const userRouter = express.Router();
userRouter
  .route("/")
  .get(requireLogin, readAll)
  .post(passwordComplexity, create);
userRouter
  .route("/:userId")
  .get(requireLogin, read)
  .put(requireLogin, hasAuthorization, update)
  .delete(requireLogin, hasAuthorization, remove);
userRouter
  .route("/:userId/followed/by/:followerId")
  .post(requireLogin, follow)
  .delete(requireLogin, unfollow);
userRouter.param("userId", userById);
module.exports = userRouter;
