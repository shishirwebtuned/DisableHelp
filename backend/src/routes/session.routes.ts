import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  cancelSession,
  getSessionById,
  getSessionsByAgreementId,
  getSessionsByUserId,
} from "../controllers/session.controller.js";

const router = express.Router();

router.get("/user", protect, getSessionsByUserId);
router.get("/agreement/:agreementId", protect, getSessionsByAgreementId);
router.get("/:sessionId", protect, getSessionById);
router.patch("/:sessionId/terminate", protect, cancelSession);

export default router;
