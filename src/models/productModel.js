import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
    },
    productName: {
      type: String,
      required: true,
      minlength: [2, "Product Name must be at least 2 characters"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "laptops & desktops",
          "computer-components",
          "storage-devices",
          "peripherals & accessories",
          "monitors & displays",
          "network & connectivity",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,

      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          "Discount price ({VALUE}) must be lower than the regular price",
      },
      default: null,
    },
    promotionType: {
      type: String,
      default: null,
    },
    totalOrders: {
      type: Number,
      validate: {
        validator: function (order) {
          return order >= 0;
        },
      },
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      validate: {
        validator: function (stock) {
          return stock > 0;
        },
      },
      default: 1,
    },
    sales: {
      type: Number,
      validate: {
        validator: function (number) {
          return number >= 0;
        },
      },
      default: 0,
    },
    altNames: {
      type: [
        {
          type: String,
          maxlength: [50, "A single keyword cannot exceed 50 characters"],
        },
      ],
      validate: {
        validator: function (array) {
          return array.length <= 20;
        },
        message: "Keywords list cannot exceed 20 words in total",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ price: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

productSchema.pre("save", async function () {
  if (this.isModified("productName")) {
    this.slug = slugify(this.productName, { lower: true, strict: true });
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
