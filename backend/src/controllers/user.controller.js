const User = require("../models/user.model");
const extend = require("lodash/extend");
const formidable = require("formidable");
const passwordComplexity = (req, res, next) => {
  const password = req.body.password;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).send({
      message:
        "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
    });
  }

  next();
};

const create = async (req, res) => {
  const user = new User(req.body);

  try {
    const userAlreadyExists = await User.findOne({ email: user.email });
    if (userAlreadyExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    const emailValid = user.email.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
    if (!emailValid) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }
    await user.save();

    return res.status(200).json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "something went wrong",
    });
  }
};
const userById = async (req, res, next, userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }
  user.hashedPassword = undefined;
  user.photo = undefined;
  req.user = user;
  next();
};
const read = async (req, res) => {
  const user = req.user;

  res.json(user);
};
const update = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    // console.log(fields);
    // console.log(files);
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    let user = req.user;
    user = extend(user, fields);
    user.updated = Date.now();
    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.filepath);
      user.photo.contentType = files.photo.type;
    }
    try {
      await user.save();
      user.hashedPassword = undefined;
      user.salt = undefined;
      res.json(user);
    } catch (err) {
      return res.status(400).json({
        error: "Sorry there's something wrong",
      });
    }
  });
};
const remove = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.user._id });
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Sorry something wrong happened" });
  }
};
const readAll = async (req, res) => {
  try {
    const users = await User.find({}).select("_id name updated");
    return res.json(users);
  } catch (err) {
    return res.status(400).json({ error: "Sorry can't retrieve users" });
  }
};
const follow = async (req, res) => {
  try {
    const followerUser = await User.findOne({ _id: req.params.followerId });
    console.log("follower", followerUser);
    if (!followerUser) {
      return res.status(404).json({ error: "Sorry user is not recognized" });
    }
    const followers = await User.findById(req.user._id)
      .select("followers")
      .exec();
    console.log("FOLLOWERS", followers);
    const following = followers.followers.includes(req.params.followerId);

    if (following) {
      return res
        .status(400)
        .json({ error: `You are already following ${req.user.name}` });
    }
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          followers: req.params.followerId,
        },
      },
      { new: true }
    );
    await User.findOneAndUpdate(
      {
        _id: req.params.followerId,
      },
      {
        $push: {
          following: req.user._id,
        },
      },
      { new: true }
    );
    return res.json({
      message: `you successfully followed ${req.user.name}`,
    });
  } catch (err) {
    return res.status(400).json({ error: "Sorry something wrong happened" });
  }
};
const unfollow = async (req, res) => {
  try {
    const followerUser = await User.findOne({ _id: req.params.followerId });
    console.log("follower", followerUser);
    if (!followerUser) {
      return res.status(404).json({ error: "Sorry user is not recognized" });
    }
    const followers = await User.findById(req.user._id)
      .select("followers")
      .exec();

    const following = followers.followers.includes(req.params.followerId);

    if (!following) {
      return res
        .status(400)
        .json({ error: `You are not following ${req.user.name}` });
    }
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: {
          followers: req.params.followerId,
        },
      },
      { new: true }
    );
    await User.findOneAndUpdate(
      {
        _id: req.params.followerId,
      },
      {
        $pull: {
          following: req.user._id,
        },
      },
      { new: true }
    );
    return res.json({
      message: `you successfully unfollowed ${req.user.name}`,
    });
  } catch (err) {
    return res.status(400).json({ error: "Sorry something wrong happened" });
  }
};
module.exports = {
  passwordComplexity,
  create,
  read,
  readAll,
  update,
  remove,
  userById,
  follow,
  unfollow,
};
