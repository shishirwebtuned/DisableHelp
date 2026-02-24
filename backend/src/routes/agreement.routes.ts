import express from "express";
import { clientOnly, protect } from "../middleware/auth.middleware.js";
import { acceptAgreementByWorker } from "../controllers/agreement.controller.js";

const router = express.Router();

router.patch("/:agreementId/accept", protect, acceptAgreementByWorker);

export default router;
