const jsonwebtoken = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const User = require("../models/user.model");
const { config } = require("../config");
const jwt = require("jsonwebtoken");

const requireLogin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: "You must be logged in to access this resource" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.token = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    if (!user.authenticate(req.body.password)) {
      return res.status(401).json({
        error: "Email and password don't match.",
      });
    }
    const token = jsonwebtoken.sign(
      {
        _id: user._id,
      },
      config.JWT_SECRET
    );
    res.cookie("t", token, {
      expire: new Date() + 9999,
    });
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(401).json({
      error: "Could not log in",
    });
  }
};

module.exports = { login, requireLogin };
