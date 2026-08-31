const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fs = require('fs');

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

const express = require("express");
require("express-async-errors");
const cors = require("cors");
const { connectPostgres, sequelize } = require("./db/connectPostgres");
require("./models"); // Initialize models and associations
const mainRouter = require("./routes/user");
const booksRouter = require("./routes/books");
const rentRouter = require("./routes/rent");
const exchangeRouter = require("./routes/exchange");
const exchangeRequestsRouter = require("./routes/exchangeRequests");
const transactionsRouter = require("./routes/transactions");
const statsRouter = require("./routes/stats");
const ordersRouter = require("./routes/orders");
const notificationsRouter = require("./routes/notifications");
const reviewsRouter = require("./routes/reviews");
const adminRouter = require("./routes/admin");
const sellerRequestsRouter = require("./routes/sellerRequests");
const aiRouter = require("./routes/ai");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
app.use("/api/v1/rent", rentRouter);
app.use("/api/rent", rentRouter);
app.use("/api/v1/exchange", exchangeRouter);
app.use("/api/v1/exchange-requests", exchangeRequestsRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/seller-requests", sellerRequestsRouter);
app.use("/api/v1/ai", aiRouter);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing. Add it to backend/.env");
    }
    await connectPostgres();
    await sequelize.sync({ alter: true });
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

start();
