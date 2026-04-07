const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  const foundUser = await User.findOne({ email: req.body.email });
  if (foundUser) {
    const isMatch = await foundUser.comparePassword(password);

    if (isMatch) {
      const token = jwt.sign(
        { id: String(foundUser._id), name: foundUser.name },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({ msg: "user logged in", token });
    }
    return res.status(400).json({ msg: "Bad password" });
  }
  return res.status(400).json({ msg: "Bad credentials" });
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `Hello, ${req.user.name}`,
    secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  return res.status(200).json({ users });
};

const register = async (req, res) => {
  const { name, email, password, role, interests } = req.body;

  if (!name || !email || !password || !role || !interests || interests.length === 0) {
    return res.status(400).json({
      msg: "Please provide name, email, password, role, and at least one interest",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      msg: "Email already in use",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    interests
  });

  res.status(201).json({
    msg: "User created successfully",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Please provide email" });
  }

  const user = await User.findOne({ email: email.trim() });
  const genericMsg =
    "If an account exists for this email, password reset instructions are available.";

  if (!user) {
    return res.status(200).json({ msg: genericMsg });
  }

  const resetToken = jwt.sign(
    { id: user._id.toString(), purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const body = { msg: genericMsg };

  if (process.env.NODE_ENV !== "production") {
    const appOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
    body.resetToken = resetToken;
    body.resetLink = `${appOrigin}/reset-password?token=${encodeURIComponent(
      resetToken
    )}`;
  }

  return res.status(200).json(body);
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide reset token and new password" });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 3 characters" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ msg: "Invalid reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      msg: "Password reset successful. You can log in with your new password.",
    });
  } catch {
    return res.status(400).json({ msg: "Invalid or expired reset token" });
  }
};

module.exports = {
  login,
  register,
  dashboard,
  getAllUsers,
  forgotPassword,
  resetPassword,
};
