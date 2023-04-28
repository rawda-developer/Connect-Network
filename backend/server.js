const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.json({message: "Hello world"});
});
app.listen(4000, () => {
  console.log("Connect Network listening on port 4000");
});
module.exports = { app };

