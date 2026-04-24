const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Simple in-memory rate limiter for password reset abuse prevention
const resetRequests = new Map();


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  const foundUser = await User.findOne({ email: req.body.email });
  if (foundUser) {
    if (foundUser.isBlocked) {
      return res.status(403).json({ msg: "Your account has been blocked due to a complaint." });
    }

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

  // Rate Limiting Logic: Max 1 request per minute per email
  const now = Date.now();
  const lastRequestTime = resetRequests.get(email);
  if (lastRequestTime && now - lastRequestTime < 60000) {
    return res.status(429).json({ msg: "Please wait before requesting another reset email." });
  }
  resetRequests.set(email, now);

  const user = await User.findOne({ email: email.trim() });
  
  // To avoid email enumeration attacks, always say we've processed it
  if (!user) {
    return res.status(200).json({ msg: "Password reset email sent successfully (if the email exists)" });
  }

  const resetToken = jwt.sign(
    { id: user._id.toString(), purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const appOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${appOrigin}/reset-password?token=${encodeURIComponent(
    resetToken
  )}`;

  const message = `You are receiving this email because a password reset request was made for your account.\n\n` +
    `Please click on the following link or paste it into your browser to complete the process:\n\n` +
    `${resetLink}\n\n` +
    `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: message,
    });
    
    return res.status(200).json({ msg: "Password reset email sent successfully" });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ msg: "Unable to send email. Please try again" });
  }
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

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ msg: "Invalid or expired reset token" });
  }

  if (decoded.purpose !== "password-reset") {
    return res.status(400).json({ msg: "Invalid reset token" });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    user.password = password;
    // Disable validation so legacy users missing 'interests' or 'role' can still reset passwords
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      msg: "Password reset successful. You can log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password save error:", err);
    return res.status(500).json({ msg: "Failed to save new password. " + (err.message || "") });
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
