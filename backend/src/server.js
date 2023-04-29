const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const { config } = require("./config");
require("dotenv").config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected!"))
    .catch((err) => {
      console.log(`DB Connection Error: ${err.message}`);
    });
  app.listen(config.PORT, () => {
    console.log("Connect Network listening on port 4000!!");
  });
}
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});
module.exports = { app };
