const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const postSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    owner: { type: Schema.ObjectId, ref: "User" },
    likes: [{ type: Schema.ObjectId, ref: "User" }],
    comments: [
      {
        text: {
          type: String,
          required: "Can't add an empty comment",
        },
        owner: {
          type: Schema.ObjectId,
          ref: "User",
        },
      },
    ],
    updated: Date,
  },

  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
