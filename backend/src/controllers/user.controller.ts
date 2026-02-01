import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResponse } from "../utils/sendResponse.js";
import multer from "multer";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email", 401);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new AppError("Incorrect Password", 401);

  if (!["admin", "instructor"].includes(user.role))
    throw new AppError("Only instructors and admins can login", 403);

  const token = generateToken(user._id.toString(), user.role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    },
  });
});
