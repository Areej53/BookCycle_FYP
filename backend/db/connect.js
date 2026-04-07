const mongoose = require("mongoose");

const connectDB = async (url) => {
  if (!url || typeof url !== "string" || !url.trim()) {
    throw new Error(
      "MONGO_URI is missing or empty. Add it to backend/.env (see backend/.env.example)."
    );
  }

  try {
    await mongoose.connect(url.trim(), {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    const reason = err?.message || "Unknown error";
    throw new Error(
      `MongoDB connection failed: ${reason}\n` +
        "Fix: (1) MONGO_URI in backend/.env is correct. " +
        "(2) For Atlas: Project → Network Access → Add IP Address → allow your current IP, or 0.0.0.0/0 for testing. " +
        "(3) Database username/password in the URI must match Database Access."
    );
  }
};

module.exports = connectDB;
