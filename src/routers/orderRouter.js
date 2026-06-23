import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  Payment,
  sendPaymentNotification,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/payment/generate-hash", authMiddleware, Payment);
orderRouter.post("/payment/notify", authMiddleware, sendPaymentNotification);

export default orderRouter;
