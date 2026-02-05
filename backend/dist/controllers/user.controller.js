import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResponse } from "../utils/sendResponse.js";
import multer from "multer";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import validator from "validator";
import { getEmailErrorMessage } from "../utils/getEmailErrorMessage.js";
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export const registerUser = catchAsync(async (req, res) => {
    const { email, password, firstName, lastName, role, phoneNumber } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email already in use", 400);
    }
    if (!validator.isEmail(email)) {
        throw new AppError("Invalid email address", 400);
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const verificationToken = hashedToken;
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        role,
        phoneNumber,
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
    });
    await newUser.save();
    const verifyUrl = `${process.env.FRONTEND_URL}/info?token=${rawToken}`;
    try {
        await sendEmail({
            to: email,
            subject: "Verify Your Email",
            html: `
    <p>Hi ${firstName},</p>
    <p>Click the button below to verify your email:</p>
    <a href="${verifyUrl}" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none;">Verify Email</a>
  `,
        });
    }
    catch (err) {
        const message = getEmailErrorMessage(err);
        console.error("EMAIL ERROR:", {
            message: err.message,
            code: err.code,
            responseCode: err.responseCode,
        });
        throw new AppError(message, 500);
    }
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Registration successful. A verification link is sent to your email.",
    });
});
export const resendVerificationEmail = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        throw new AppError("User not found", 404);
    if (user.isVerified) {
        throw new AppError("Email already verified", 400);
    }
    // generate new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const verificationToken = hashedToken;
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();
    const verifyUrl = `${process.env.FRONTEND_URL}/info?token=${rawToken}`;
    try {
        await sendEmail({
            to: user.email,
            subject: "Verify Your Email",
            html: `
      <p>Hi ${user.firstName},</p>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${verifyUrl}" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none;">
        Verify Email
      </a>
    `,
        });
    }
    catch (err) {
        const message = getEmailErrorMessage(err);
        console.error("EMAIL ERROR:", {
            message: err.message,
            code: err.code,
            responseCode: err.responseCode,
        });
        throw new AppError(message, 500);
    }
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Verification email resent. Please check your inbox.",
    });
});
export const verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.query;
    if (!token)
        throw new AppError("Token is required", 400);
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: new Date() },
    });
    if (!user)
        throw new AppError("Invalid or expired token", 400);
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Email verified successfully",
        data: {
            email: user.email,
        },
    });
});
export const loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        throw new AppError("Invalid email", 401);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        throw new AppError("Incorrect Password", 401);
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
    if (!user)
        throw new AppError("Email not found", 404);
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
    if (!user)
        throw new AppError("Email not found", 404);
    if (user.otp !== otp)
        throw new AppError("Invalid OTP", 400);
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
    if (!user)
        throw new AppError("Email not found", 404);
    user.password = newPassword;
    await user.save();
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Password has been reset successfully",
    });
});
export const changePassword = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: userId, email });
    if (!user)
        throw new AppError("User not found", 404);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
        throw new AppError("Current password is incorrect", 400);
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
export const getMe = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    if (!user)
        throw new AppError("User not found", 404);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User profile retrieved successfully",
        data: user,
    });
});
//# sourceMappingURL=user.controller.js.map