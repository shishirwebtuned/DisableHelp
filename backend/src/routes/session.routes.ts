import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  cancelSession,
  getSessionsByAgreementId,
  getSessionsByUserId,
} from "../controllers/session.controller.js";

const router = express.Router();

router.get("/user", protect, getSessionsByUserId);
router.patch("/:sessionId/terminate", protect, cancelSession);
router.get("/:agreementId", protect, getSessionsByAgreementId);

export default router;
