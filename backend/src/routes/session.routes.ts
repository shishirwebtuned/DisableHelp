import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getSessionsByAgreementId } from "../controllers/session.controller.js";

const router = express.Router();

router.get("/:agreementId", protect, getSessionsByAgreementId);

export default router;
