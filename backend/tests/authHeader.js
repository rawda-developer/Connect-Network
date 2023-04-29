const User = require("../src/models/user.model");
const supertest = require("supertest");
const { app } = require("../src/server");
const request = supertest(app);
let user;
const createUser = async () => {
  user = new User({
    name: "Test",
    email: "test1@test.com",
    password: "testTest123*&",
  });
  user = await user.save();
  return user;
};
const getUserHeader = async () => {
  const res = await request.post("/api/auth/login").send({
    email: "test1@test.com",
    password: "testTest123*&",
  });

  return res.body.token;
};
module.exports = { user, createUser, getUserHeader };
