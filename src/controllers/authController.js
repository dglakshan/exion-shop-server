import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import { generatePassword } from "../utils/generatePassword.js";
import { sendOtpEmail, sendPaswordEmail } from "../utils/sendEmail.js";

export const checkSetupStatus = expressAsyncHandler(async (req, res) => {
  const hasSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });

  res
    .status(STATUS_CODES.SUCCESS)
    .json({ status: "success", hasSuperAdmin: !!hasSuperAdmin });
});

export const setupInitialOwner = expressAsyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName)
    next(
      new AppError("First name feild is required", STATUS_CODES.BAD_REQUEST),
    );

  if (!email)
    next(new AppError("Email feild is required", STATUS_CODES.BAD_REQUEST));

  const isSetupDone = await User.findOne({ role: ROLES.SUPER_ADMIN });

  if (isSetupDone) {
    return next(
      new AppError(
        "Setup has already been completed. Action forbidden!",
        STATUS_CODES.FORBIDDEN,
      ),
    );
  }

  await User.create({
    firstName,
    lastName,
    email,
    password,
    address,
    role: ROLES.SUPER_ADMIN,
    userId: "SAD-001",
    isVerified: true,
  });

  res.status(STATUS_CODES.CREATED).json({
    status: "success",
    message:
      "Welcome Owner! Your Exion Computer Super-Admin account has been created successfully. Setup Complete!",
  });
});

export const userRegister = expressAsyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName)
    return next(
      new AppError("First name field required", STATUS_CODES.BAD_REQUEST),
    );
  if (!email)
    return next(new AppError("Email field required", STATUS_CODES.BAD_REQUEST));

  let finalRole = "customer";
  let isVerified = false;
  let finalPassword = null;

  if (role && role !== ROLES.ADMIN && !password) {
    return next(
      new AppError("Password field required", STATUS_CODES.BAD_REQUEST),
    );
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    if (isRegistered.role === ROLES.ADMIN)
      return next(
        new AppError("Admin already registered", STATUS_CODES.FORBIDDEN),
      );
    if (isRegistered.role === ROLES.CUSTOMER)
      return next(
        new AppError("User already registered", STATUS_CODES.FORBIDDEN),
      );
  }

  // Role validation & Super Admin permission guard checks
  if (role === ROLES.ADMIN) {
    if (!req.user || req.user.role !== ROLES.SUPER_ADMIN) {
      return next(
        new AppError(
          "You do not have permission to create an admin account",
          STATUS_CODES.FORBIDDEN,
        ),
      );
    }
    finalRole = ROLES.ADMIN;
    isVerified = true; // Admins are auto-verified since password is sent via email
    finalPassword = generatePassword();
  } else if (role === ROLES.SUPER_ADMIN) {
    return next(
      new AppError(
        "Creating a Super-Admin via API is strictly forbidden!",
        STATUS_CODES.FORBIDDEN,
      ),
    );
  }

  let OTP = undefined;
  let otpExpires = undefined;

  if (finalRole === ROLES.CUSTOMER) {
    OTP = createOTP();
    otpExpires = new Date().getTime() + 5 * 60 * 1000;
    finalPassword = password;
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: finalPassword,
    isVerified,
    role: finalRole,
    OTP,
    otpIsExpires: otpExpires,
  });

  if (!newUser)
    return next(new AppError("Something went wrong during user creation", 500));

  // Handle Notifications based on Role
  if (finalRole === ROLES.ADMIN) {
    const emailResult = await sendPaswordEmail(email, finalPassword);
    if (!emailResult) {
      await User.deleteOne({ email });
      return next(
        new AppError("Email delivery failed", STATUS_CODES.SERVER_ERROR),
      );
    }

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Admin registration successful. Check email for setup keys.",
    });
  } else {
    // Customer OTP Path
    const emailResult = await sendOtpEmail(email, OTP);
    console.log(emailResult);
    if (!emailResult) {
      await User.findOneAndDelete({ email });

      return next(new AppError("OTP send fail", STATUS_CODES.SERVER_ERROR));
    }

    // CRITICAL: Return the email to the frontend to pass to the OTP route!
    return res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      redirectToOtp: true,
      email: email, // Passed back so frontend knows whose OTP to verify
      message:
        "Registration initial step successful. Please check your email for the OTP code.",
    });
  }
});

export const verifyOTP = expressAsyncHandler(async (req, res, next) => {
  const { email, enterdOTP } = req.body;

  if (!email || !enterdOTP) {
    return next(
      new AppError("Email and OTP are required", STATUS_CODES.BAD_REQUEST),
    );
  }

  const findUser = await User.findOne({ email }).select(
    "+password +isVerified",
  );

  if (!findUser)
    return next(
      new AppError("Something with wrong", STATUS_CODES.SERVER_ERROR),
    );

  if (findUser.OTP != enterdOTP)
    return next(new AppError("Invalid OTP code", STATUS_CODES.BAD_REQUEST));

  if (new Date().getTime() > findUser.otpIsExpires)
    return next(new AppError("OTP has expired! Please register again"));

  findUser.isVerified = true;
  findUser.OTP = undefined;
  findUser.otpIsExpires = undefined;

  await findUser.save();

  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Email verified successfully! Your account is now active.",
    userID: findUser.userId,
  });
});

export const userLogin = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validation (Email field එකේ අකුර spelling නිවැරදි කළා)
  if (!email) {
    return next(
      new AppError("Email field is required", STATUS_CODES.BAD_REQUEST),
    );
  }
  if (!password) {
    return next(
      new AppError("Password field is required", STATUS_CODES.BAD_REQUEST),
    );
  }

  // 2. 🟢 එකම එක පාරක් Query කර password එකත් සමඟ user ව ලබා ගැනීම
  const user = await User.findOne({ email }).select("+password");

  // User කෙනෙක් නැත්නම් කෙලින්ම error එක දෙනවා
  if (!user) {
    return next(
      new AppError("User not found. Register first", STATUS_CODES.NOT_FOUND),
    );
  }

  // 3. 🟢 🔴 නිවැරදි ක්‍රමය: User Model එක උඩ නොවී, සොයාගත් 'user' object එක උඩ method එක දුවවීම
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError("Invalid password", STATUS_CODES.BAD_REQUEST));
  }

  // 4. 🟢 token එකට user.userId සහ user.role නිවැරදිව ලබාදීම
  const token = await genarateToken({
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user.userId,
    email: user.email,
    role: user.role,
  });

  console.log("Generated Token: ", token);

  // 5. Cookie එක සැකසීම
  res.cookie("token", token, {
    httpOnly: true,
    // 🟢 Localhost එකේදී සරලව වැඩ කරන්න මෙන්න මේ සැකසුම් ටික දාන්න:
    secure: process.env.NODE_ENV === "production", // production එකේදී විතරක් true වේ
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 👈 local දුවද්දී 'lax' වීම අනිවාර්යයි
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // දින 1යි
  });

  // 6. Response එක යැවීම
  res.status(STATUS_CODES.SUCCESS).json({
    status: "success",
    userData: {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  });
});
