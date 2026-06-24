import { config } from "../config/appConfig.js";
import Order from "../models/orderModel.js";
import expressAsyncHandler from "express-async-handler";
import crypto from "crypto";

export const Payment = expressAsyncHandler(async (req, res) => {
  const { amount, currency, items, userEmail } = req.body;

  const order_id = `ORD_${Date.now()}`;

  const newOrder = await Order.create({
    orderId: order_id,
    user: userEmail || "Guest User",
    items: items,
    amount: amount,
    currency: currency || "LKR",
    paymentStatus: "PENDING",
  });
  //

  const merchant_id = config.payHereMerchantId;
  const merchant_secret = config.payHepayHereMerchantSecret;

  if (!merchant_id || !merchant_secret) {
    res.status(500);
    throw new Error("Merchant credentials are missing in server environment.");
  }

  const hashedSecret = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();
  const amountFormated = parseFloat(amount).toFixed(2).toString();

  const hash = crypto
    .createHash("md5")
    .update(merchant_id + order_id + amountFormated + currency + hashedSecret)
    .digest("hex")
    .toUpperCase();

  res.status(200).json({
    merchant_id,
    order_id,
    hash,
    amount: amountFormated,
  });
});

export const sendPaymentNotification = expressAsyncHandler(async (req, res) => {
  const { order_id, status_code } = req.body;

  if (status_code === "2") {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: order_id },
      { paymentStatus: "PAID" },
      { new: true },
    );

    if (!updatedOrder) {
      res.status(404);
      throw new Error(`Order ${order_id} not found in database.`);
    }

    console.log(`🎯 Order ${order_id} successfully marked as PAID.`);
    return res.status(200).send("Payment processed successfully");
  } else {
    await Order.findOneAndUpdate({
      orderId: order_id,
      paymentStatus: "FAILED",
    });
    return res.status(400).send("Payment failed or canceled by user");
  }
});
