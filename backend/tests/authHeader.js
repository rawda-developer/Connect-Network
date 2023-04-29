const User = require("../src/models/user.model");
const supertest = require("supertest");
const { app } = require("../src/server");
const request = supertest(app);
let user, user2;
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
const createUser2 = async () => {
   user2 = new User({
    name: "Test2",
    email: "test2@test.com",
    password: "testTest123*&",
  });
  user2 = await user2.save();
  return user2;
};
const getUser2Header = async () => {
  const res = await request.post("/api/auth/login").send({
    email: "test2@test.com",
    password: "testTest123*&",
  });

  return res.body.token;
};
module.exports = {
  user,
  user2,
  createUser,
  getUserHeader,
  createUser2,
  getUser2Header,
};
