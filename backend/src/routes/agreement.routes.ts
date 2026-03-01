import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  acceptAgreementByWorker,
  getAgreementById,
  getAgreementsByClient,
  getAgreementByJob,
  getAgreementsByWorker,
  getAllAgreements,
  terminateAgreement,
} from "../controllers/agreement.controller.js";

const router = express.Router();

router.patch("/:agreementId/accept", protect, acceptAgreementByWorker);
router.patch("/:agreementId/terminate", protect, terminateAgreement);
router.get("/", protect, getAllAgreements);

router.get("/client", protect, getAgreementsByClient);
router.get("/worker", protect, getAgreementsByWorker);
router.get("/job/:jobId", protect, getAgreementByJob);
router.get("/:agreementId", protect, getAgreementById);

export default router;
