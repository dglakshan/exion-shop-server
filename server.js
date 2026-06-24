import express from "express";
import cookieParser from "cookie-parser";
import dbConnection from "./src/config/db.js";
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js";
import orderRouter from "./src/routers/orderRouter.js";
import productRouter from "./src/routers/productRouter.js";
import userRouter from "./src/routers/userRouter.js";
import cors from "cors";
import { config } from "./src/config/appConfig.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order/", orderRouter);

// 3. Error Handling (Must be last)
app.use(errorMiddleware);

const startServer = async () => {
  try {
    // Ensure DB is connected before starting the server
    await dbConnection();
    console.log("Database connected successfully.");

    app.listen(config.port, () => {
      console.log(`Server started on port ${config.port}`);
    });
  } catch (error) {
    console.error(
      "Failed to start the server due to DB connection error:",
      error,
    );
    process.exit(1); // Exit process with failure
  }
};

startServer();
