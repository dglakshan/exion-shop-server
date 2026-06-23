import expressAsyncHandler from "express-async-handler";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";

export const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  // 1. 🟢 නිවැරදි ක්‍රමය: req.cookies (s අකුර ඇතුව) මඟින් token එක ගැනීම
  const token = req.cookies?.token;

  if (!token) {
    return next(
      new AppError(
        "Please login before performing this action",
        STATUS_CODES.UNAUTHORIZED,
      ), // 👈 Arguments පිළිවෙල නිවැරදි කළා
    );
  }

  try {
    // 2. 🟢 Token එක verify කිරීම
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 🟢 Verified තොරතුරු req.user එකට ඇතුළත් කිරීම
    req.user = decoded;

    // ඊළඟ Controller එකට අවසර දීම
    next();
  } catch (error) {
    // Token එක කල් ඉකුත් වී (Expired) හෝ වෙනස් කර ඇත්නම් මෙතනට පැමිණේ
    return next(
      new AppError(
        "Unauthorized access! Invalid or expired token.",
        STATUS_CODES.UNAUTHORIZED,
      ),
    );
  }
});
