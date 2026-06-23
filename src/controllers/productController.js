import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { AppError } from "../utils/appError.js";
import { generateProductId } from "../utils/generateProductId.js";

export const addProduct = expressAsyncHandler(async (req, res, next) => {
  const {
    productId,
    productName,
    category,
    brand,
    model,
    description,
    price,
    promotionType,
    visibility,
    discountPrice,
    quantity,
    images,
    altNames,
  } = req.body;

  if (
    !(
      productId &&
      productName &&
      category &&
      brand &&
      model &&
      price &&
      quantity &&
      images &&
      images.length > 0
    )
  ) {
    return next(
      new AppError(
        "Fill out all required fields before adding product",
        STATUS_CODES.BAD_REQUEST,
      ),
    );
  }

  // 2. Prevent duplicate entries
  const isAvailable = await Product.findOne({ productName, model });
  if (isAvailable) {
    return next(new AppError("Product already added", STATUS_CODES.FORBIDDEN));
  }

  // 3. Persist collection record document
  const newProduct = await Product.create({
    productId,
    productName,
    promotionType: promotionType || null,
    category,
    slug: "",
    brand,
    model,
    visibility: visibility !== undefined ? visibility : true,
    price,
    discountPrice: discountPrice || undefined,
    quantity,
    description: description || "",
    images,
    altNames: Array.isArray(altNames) ? altNames : [],
  });

  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Product added successfully",
  });
});

export const updateProduct = expressAsyncHandler(async (req, res, next) => {
  const {
    productId,
    productName,
    category,
    brand,
    model,
    description,
    price,
    promotionType,
    visibility,
    discountPrice,
    quantity,
    images,
    altNames,
  } = req.body;

  const { _id } = req.params;

  // 1. Core structural requirement validations
  if (
    !(
      productId &&
      productName &&
      category &&
      brand &&
      model &&
      price &&
      quantity &&
      images &&
      images.length > 0
    )
  ) {
    return next(
      new AppError(
        "Fill out all required fields before updating product",
        STATUS_CODES.BAD_REQUEST,
      ),
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    {
      productId,
      productName,
      promotionType: promotionType || null,
      category,
      slug: "",
      brand,
      model,
      visibility: visibility !== undefined ? visibility : true,
      price,
      discountPrice: discountPrice || undefined,
      quantity,
      description: description || "",
      images,
      altNames: Array.isArray(altNames) ? altNames : [],
    },
    { new: true, runValidators: true },
  );

  // 4. Fallback check if document wasn't found
  if (!updatedProduct) {
    return next(
      new AppError(
        "No product found with that database ID",
        STATUS_CODES.NOT_FOUND,
      ),
    );
  }

  // 5. Send JSON response payload downward
  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Product updated successfully", // 🟢 FIXED: Updated feedback string
  });
});

export const latestProducts = expressAsyncHandler(async (req, res, next) => {
  const products = await Product.find({ visibility: true })
    .sort({ createdAt: -1 })
    .limit(12);

  if (!products)
    return next(
      new AppError("Error fetching latest product", STATUS_CODES.SERVER_ERROR),
    );

  res
    .status(STATUS_CODES.SUCCESS)
    .json({ success: true, latestProducts: products });
});

export const allProducts = expressAsyncHandler(async (req, res, next) => {
  // 1. Frontend එකෙන් එවන minPrice සහ maxPrice (Query Params) ලබාගැනීම
  const { minPrice, maxPrice } = req.query;

  // මූලික Query එක (visibility true තියෙන ඒවා විතරයි)
  let query = { visibility: true };

  // 2. 🟢 මිල ගණන් එවා ඇත්නම් පමණක් Query එකට MongoDB Comparison Operators ($gte, $lte) එකතු කිරීම
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice); // මෙම මිලට සමාන හෝ වැඩි (Greater Than or Equal)
    if (maxPrice) query.price.$lte = Number(maxPrice); // මෙම මිලට සමාන හෝ අඩු (Less Than or Equal)
  }

  // 3. සකස් කරගත් query එක භාවිතයෙන් Database එකෙන් සෙවීම
  const products = await Product.find(query).sort({
    createdAt: -1,
  });

  if (!products)
    return next(
      new AppError("Error fetching latest product", STATUS_CODES.SERVER_ERROR),
    );

  res
    .status(STATUS_CODES.SUCCESS)
    .json({ success: true, allProducts: products });
});

export const generateId = expressAsyncHandler(async (req, res, next) => {
  const { category, brand } = req.query;

  console.log("📥 Incoming Request Queries:", req.query);

  const resultId = await generateProductId(category, brand, next);

  res.status(STATUS_CODES.SUCCESS || 200).json({
    success: true,
    productId: resultId,
  });
});
