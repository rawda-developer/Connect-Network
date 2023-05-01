const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const commentSchema = new Schema({
  text: {
    type: String,
    required: "Can't add an empty comment",
  },
  post: { type: Schema.ObjectId, ref: "Post" },
  owner: {
    type: Schema.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Comment", commentSchema);
