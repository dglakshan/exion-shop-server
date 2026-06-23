import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { CITIES, DISTRICTS } from "../utils/sriLanksData.js";
import { ROLES } from "../utils/constants.js";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  district: {
    type: String,
    required: true,
    enum: {
      values: DISTRICTS,
      message: "Please select valid district",
    },
  },
  city: {
    type: String,
    required: true,
    enum: {
      values: CITIES,
      message: "Please select valid city",
    },
  },
  postalCode: { type: Number, required: true },
  mobile: {
    type: Number,
    required: true,
    minlength: [10, "Mobile number must at least 10 characters"],
    maxlength: [10, "Address cannot exsist 10 caracters"],
  },
  address: {
    type: String,
    required: true,
    minlength: [2, "Address must at least 2 characters"],
    maxlength: [100, "Address cannot exsist 100 caracters"],
  },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exsist 60 caracters"],
    },
    lastName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exsist 60 caracters"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/,
        "Please provide a valid email address",
      ],
    },
    userId: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "customer"],
        message: "Role must be admin or customer",
      },
      default: "customer",
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // 🟢 select: false එක ඉවත් කළා (TTL එකට සහ Verification වලට ලේසි වෙන්න)
    },
    address: [addressSchema],
    OTP: String,
    otpIsExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ role: 1 });

// 🟢 Partial TTL Index (විනාඩි 5න් මකා දැමීම)
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 300,
    partialFilterExpression: { isVerified: false },
  },
);

// Hash Password Before Save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Auto Generate Custom User ID
userSchema.pre("save", async function () {
  if (!this.isNew || this.userId) return;

  if (!this.role) {
    throw new AppError("Role is required to generate User ID", 400);
  }

  if (this.role === "admin" || this.role === ROLES.ADMIN) {
    const count = await mongoose
      .model("User")
      .countDocuments({ role: "admin" });
    this.userId = `ADM-${String(count + 1).padStart(3, "0")}`;
  } else if (this.role === "customer" || this.role === ROLES.CUSTOMER) {
    const count = await mongoose
      .model("User")
      .countDocuments({ role: "customer" });
    this.userId = `CUS-${String(count + 1).padStart(3, "0")}`;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enterdPassword) {
  return bcrypt.compare(enterdPassword, this.password);
};

// 🟢 await එක ඉවත් කර සාමාන්‍ය පරිදි Model එක නිර්මාණය කළා
const User = mongoose.models.User || mongoose.model("User", userSchema);

// 🟢 බලාත්කාරයෙන් Index එක DB එක ඇතුළේ සාදන්න (Force Create Index)
User.createIndexes()
  .then(() =>
    console.log("🟢 User TTL Partial Index created successfully in MongoDB!"),
  )
  .catch((err) => console.error("❌ Index creation failed:", err.message));

export default User;
