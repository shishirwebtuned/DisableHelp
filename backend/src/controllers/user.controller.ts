import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResponse } from "../utils/sendResponse.js";
import multer from "multer";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const registerUser = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, role, phoneNumber } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const newUser = new User({
    email,
    password,
    firstName,
    lastName,
    role,
    phoneNumber,
  });

  await newUser.save();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Registration successful",
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email", 401);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new AppError("Incorrect Password", 401);

  if (!["admin", "client", "worker"].includes(user.role)) {
    throw new AppError("Invalid user role", 403);
  }

  const token = generateToken(user._id.toString(), user.role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
      token,
    },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email not found", 404);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP has been sent to your email",
  });
});

export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new AppError("Email not found", 404);

  if (user.otp !== otp) throw new AppError("Invalid OTP", 400);

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP verified successfully",
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email not found", 404);

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password has been reset successfully",
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { email, currentPassword, newPassword } = req.body;

  const user = await User.findOne({ _id: userId, email });
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect", 400);

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password changed successfully",
  });
});

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password -otp -otpExpiry");
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: users,
  });
});
