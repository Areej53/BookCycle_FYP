const jwt = require("jsonwebtoken");
const { User, RiderApplication } = require("../models");
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

  // Check if it's the admin login
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  if (adminEmail && adminPasswordHash && email === adminEmail) {
    const bcrypt = require('bcryptjs');
    const isAdminMatch = await bcrypt.compare(password, adminPasswordHash);
    
    if (isAdminMatch) {
      const token = jwt.sign(
        { id: 'admin', name: 'Administrator', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({ 
        msg: "admin logged in", 
        token,
        role: 'admin'
      });
    }
  }

  const foundUser = await User.findOne({ where: { email } });
  if (foundUser) {
    if (foundUser.isBlocked) {
      return res.status(403).json({ msg: "Your account has been blocked due to a complaint." });
    }

    const isMatch = await foundUser.comparePassword(password);

    if (isMatch) {
      const token = jwt.sign(
        { id: String(foundUser.id), name: foundUser.name, role: foundUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      const riderApp = await RiderApplication.findOne({ where: { userId: foundUser.id } });

      return res.status(200).json({ 
        msg: "user logged in", 
        token,
        role: foundUser.role,
        riderStatus: riderApp ? riderApp.status : null,
        rejectionReason: riderApp ? riderApp.rejectionReason : null
      });
    }
    return res.status(400).json({ msg: "Wrong password" });
  }
  return res.status(400).json({ msg: "Wrongcredentials" });
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `Hello, ${req.user.name}`,
    secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  return res.status(200).json({ users });
};

const register = async (req, res) => {
  const { name, email, password, role = "customer", interests } = req.body;
  const userRole = role || "customer";

  if (!name || !email || !password || !interests || interests.length === 0) {
    return res.status(400).json({
      msg: "Please provide name, email, password, and at least one interest",
    });
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return res.status(400).json({
      msg: "Email already in use",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
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

  const user = await User.findOne({ where: { email: email.trim() } });
  
  // To avoid email enumeration attacks, always say we've processed it
  if (!user) {
    return res.status(200).json({ msg: "Password reset email sent successfully (if the email exists)" });
  }

  const resetToken = jwt.sign(
    { id: user.id.toString(), purpose: "password-reset" },
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

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #666;">You are receiving this email because a password reset request was made for your account.</p>
      <p style="color: #666;">Please click on the following link or paste it into your browser to complete the process:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all; font-size: 12px;">${resetLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - BookCycle",
      message: message,
      html: htmlMessage,
    });
    
    console.log(`Password reset email sent successfully to: ${user.email}`);
    return res.status(200).json({ msg: "Password reset email sent successfully" });
  } catch (err) {
    console.error("Email send error for user:", user.email);
    console.error("Full error details:", err);
    
    // Provide more specific error message based on error type
    let errorMessage = "Unable to send email. Please try again";
    if (err.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please check SMTP credentials.";
    } else if (err.code === 'ECONNECTION') {
      errorMessage = "Could not connect to email server. Please try again later.";
    } else if (err.code === 'EMESSAGE') {
      errorMessage = "Email message format error.";
    } else if (err.responseCode === 550 || err.responseCode === 553) {
      errorMessage = "Email address rejected by server.";
    }
    
    return res.status(500).json({ msg: errorMessage });
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
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    user.password = password;
    // Save password. In Sequelize, hooks: true ensures password hashing hook is invoked
    await user.save();

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
