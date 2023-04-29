const User = require("../models/user.model");

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

module.exports = { passwordComplexity, create };
