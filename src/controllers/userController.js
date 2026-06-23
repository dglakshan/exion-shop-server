import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";

export const updateUserInfo = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.user;

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("User not found", STATUS_CODES.NOT_FOUND));

  const { firstName, lastName } = req.body;

  if (!firstName)
    return next(
      new AppError("First name is required", STATUS_CODES.BAD_REQUEST),
    );

  user.firstName = firstName;

  if (lastName) {
    user.lastName = lastName;
  } else {
    user.lastName = "";
  }

  await user.save();

  res
    .status(STATUS_CODES.SUCCESS)
    .json({ status: "success", message: "Profile update successfully" });
});

export const addAddress = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.user;

  const { street, district, city, postalCode, mobile, address } = req.body;

  if (!(street && district && city && postalCode && mobile && address))
    return next(new AppError("All field required", STATUS_CODES.BAD_REQUEST));

  const updateAddress = await User.findOneAndUpdate(
    { email },
    {
      $push: {
        address: {
          street,
          district,
          city,
          postalCode,
          mobile,
          address,
        },
      },
    },
    { new: true, runValidators: true },
  );

  if (!updateAddress)
    return next(new AppError("User not found", STATUS_CODES.NOT_FOUND));

  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Address adding successfully",
  });
});

export const updateAddress = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const { address_id } = req.body;

  const { street, district, city, postalCode, mobile, address } = req.body;

  if (!(street && district && city && postalCode && mobile && address))
    return next(new AppError("All field required", STATUS_CODES.BAD_REQUEST));

  const updateAddress = await User.findOneAndUpdat(
    { email, "address._id": address_id },
    {
      $set: {
        address: {
          street,
          district,
          city,
          postalCode,
          mobile,
          address,
        },
      },
    },
    { new: true, runValidators: true },
  );

  if (!updateAddress)
    return next(new AppError("User not found", STATUS_CODES.NOT_FOUND));

  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Address updated successfully",
  });
});

export const getUserInfo = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.user;

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("User not found", STATUS_CODES.NOT_FOUND));

  res.status(STATUS_CODES.SUCCESS).json({ status: "success", userInfo: user });
});
