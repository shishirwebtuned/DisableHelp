import express from "express";
import { sendInvite } from "../controllers/invite.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/worker", protect, sendInvite);

export default router;
