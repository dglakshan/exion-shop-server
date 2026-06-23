import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user!"],
    },
    orderItems: [orderItemSchema],

    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: { type: String, required: true },
      address: { type: String, required: true },
      mobile: { type: Number, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "COD"],
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    discountPrice: { type: Number, required: true, default: 0.0 },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: Date,

    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
//

const Order = mongoose.model("Order", orderSchema);
export default Order;
