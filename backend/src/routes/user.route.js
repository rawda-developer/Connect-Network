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
  update,
  remove
} = require("../controllers/user.controller");

const userRouter = express.Router();
userRouter.route("/").post(passwordComplexity, create);
userRouter
  .route("/:userId")
  .get(requireLogin, read)
  .put(requireLogin, hasAuthorization, update)
  .delete(requireLogin, hasAuthorization, remove)
userRouter.param("userId", userById);
module.exports = userRouter;
