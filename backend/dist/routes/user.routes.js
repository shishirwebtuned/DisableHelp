import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import { changePassword, forgotPassword, getAllUsers, getMe, loginUser, registerUser, resetPassword, verifyEmail, verifyOtp, } from "../controllers/user.controller.js";
const router = express.Router();
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);
router.get("/all", getAllUsers);
router.get("/me", protect, getMe);
router.post("/verify-email", verifyEmail);
export default router;
//# sourceMappingURL=user.routes.js.map