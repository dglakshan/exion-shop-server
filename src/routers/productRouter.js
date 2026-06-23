import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { ROLES } from "../utils/constants";
import {
  addProduct,
  allProducts,
  generateId,
  latestProducts,
} from "../Controllers/ProductController.js";

const productRouter = express.Router();

productRouter.post(
  "/addProduct",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  addProduct,
);
productRouter.get("/latestProducts", latestProducts);
productRouter.get("/allproducts", allProducts);
productRouter.get(
  "/generateproductid",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  generateId,
);

export default productRouter;
