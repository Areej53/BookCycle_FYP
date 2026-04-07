const errorHandler = (err, req, res, next) => {
  console.error("[API Error]", err);

  if (err.name === "CastError") {
    return res.status(400).json({ msg: "Invalid data provided" });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(". ");
    return res.status(400).json({ msg: messages || "Validation failed" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(400).json({
      msg:
        field === "email"
          ? "Email already in use"
          : "That value is already taken",
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }

  const status = err.statusCode || 500;
  const rawMsg =
    status === 500
      ? "Something went wrong on the server. Please try again later."
      : err.message;
  const msg =
    typeof rawMsg === "string" && rawMsg.trim().length > 0
      ? rawMsg.trim()
      : status >= 500
        ? "Something went wrong on the server. Please try again later."
        : "Request could not be completed. Please check your input and try again.";

  return res.status(status).json({ msg });
};

module.exports = errorHandler;
