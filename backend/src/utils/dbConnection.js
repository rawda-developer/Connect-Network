const mongoose = require("mongoose");
const dbSetting  = require("./dbSettings");
require("dotenv").config();

const connect = async () => {
  const env = process.env.NODE_ENV || "test";
  const mongoString = dbSetting[env].url;
  console.log(mongoString);
  await mongoose.connect(mongoString);
  const database = mongoose.connection;
  database.on("error", (error) => {
    console.log(error);
  });

  database.once("connected", () => {
    console.log("Database Connected");
  });
};

// Remove and close the database and server.
const close = async () => {
  await mongoose.disconnect();
  //   await mongoServer.stop();
  console.log("Connection closed");
};

// Remove all data from collections
const clear = async () => {
  process.env.NODE_ENV = "test";
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    collections[key].deleteMany({}).then(() => console.log("Data deleted"));
  }
};
module.exports = { connect, clear, close };
