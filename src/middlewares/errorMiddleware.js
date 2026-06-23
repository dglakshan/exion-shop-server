import { STATUS_CODES } from "../utils/constants.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  const message = err.message || "something with wrong";
  const status = err.status;

  res.status(statusCode).json({ status, message });
};
