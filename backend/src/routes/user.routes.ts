import express from "express";
import {
  adminOnly,
  clientOnly,
  protect,
  workerOnly,
} from "../middleware/auth.middleware.js";
import {
  changePassword,
  forgotPassword,
  getAllUsers,
  getMe,
  getMyClients,
  getMyWorkers,
  getUserById,
  getWorkersWithProfile,
  loginUser,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  verifyOtp,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

router.get("/all", getAllUsers);
router.get("/workers-profile", getWorkersWithProfile);
router.get("/me", protect, getMe);

router.get("/my/workers", protect, clientOnly, getMyWorkers);

router.get("/my/clients", protect, workerOnly, getMyClients);

router.get("/:userId", protect, getUserById);
router.post("/verify-email", verifyEmail);
router.post("/resend-verify-email", resendVerificationEmail);

export default router;
