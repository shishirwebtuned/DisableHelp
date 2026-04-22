import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import { approveUser, suspendUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.patch("/approve/:userId", protect, adminOnly, approveUser);

router.patch("/suspend/:userId", protect, adminOnly, suspendUser);

export default router;
