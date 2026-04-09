const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
require("express-async-errors");
const cors = require("cors");
const connectDB = require("./db/connect");
const mainRouter = require("./routes/user");
const booksRouter = require("./routes/books");
const transactionsRouter = require("./routes/transactions");
const statsRouter = require("./routes/stats");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const ok =
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      return ok ? callback(null, true) : callback(null, false);
    },
    credentials: true,
  })
);
app.use("/api/v1", mainRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/stats", statsRouter);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing. Add it to backend/.env");
    }
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
