const express = require("express");
const { requireLogin } = require("../controllers/auth.controller");
const {
  create,
  passwordComplexity,
  userById,
  read,
} = require("../controllers/user.controller");

const userRouter = express.Router();
userRouter.route("/").post(passwordComplexity, create);
userRouter.route("/:userId").get(requireLogin, read);
userRouter.param("userId", userById);
module.exports = userRouter;
