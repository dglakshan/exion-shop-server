import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { config } from "../config/appConfig.js";

export const genarateToken = ({ userId, firstName, lastName, email, role }) => {
  return jwt.sign(
    {
      userId,
      firstName,
      lastName,
      email,
      role,
    },
    config.jwtSecret,
    {
      expiresIn: "30d",
    },
  );
};
