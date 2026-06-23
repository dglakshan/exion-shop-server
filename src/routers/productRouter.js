import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../utils/constants.js";
import {
  addProduct,
  latestProducts,
  generateId,
  allProducts,
} from "../controllers/productController.js";

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
