const jsonwebtoken = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const User = require("../models/user.model");
const { config } = require("../config");
const jwt = require("jsonwebtoken");
const requireLogin = expressjwt({
  secret: config.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});
const hasAuthorization = (req, res, next) => {
  const authorized = req.user && req.auth && req.user._id == req.auth._id;
  if (!authorized) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
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

module.exports = { login, requireLogin, hasAuthorization };
