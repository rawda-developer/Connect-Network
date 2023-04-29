const express = require("express");
const {
  create,
  passwordComplexity,
} = require("../controllers/user.controller");

const userRouter = express.Router();
userRouter.route("/").post(passwordComplexity, create);
module.exports = userRouter;
