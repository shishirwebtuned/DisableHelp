import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import {
  changePassword,
  forgotPassword,
  getAllUsers,
  loginUser,
  registerUser,
  resetPassword,
  verifyOtp,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/loginn", loginUser);
router.post("/register", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

router.get("/all", getAllUsers);

export default router;
