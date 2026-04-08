import express from "express";
import {
  sendInvite,
  checkInvitation,
} from "../controllers/invite.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/check", protect, checkInvitation);

router.post("/worker", protect, sendInvite);

export default router;
