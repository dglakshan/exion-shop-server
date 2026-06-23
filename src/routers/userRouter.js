import express from "express";
import {
  userLogin,
  userRegister,
  verifyOTP,
} from "../controllers/authController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../utils/constants.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/verify", verifyOTP);

userRouter.post(
  "/create-admin",
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  userRegister,
);

export default userRouter;
