import express from "express";
import { clientOnly, protect } from "../middleware/auth.middleware.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByApplicantId,
  getApplicationsByJobId,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

router.post("/", protect, createApplication);

router.get("/applicant/:applicantId", protect, getApplicationsByApplicantId);
router.get("/job/:jobId", protect, getApplicationsByJobId);

router.get("/", protect, getAllApplications);
router.patch(
  "/:applicationId/status",
  protect,
  clientOnly,
  updateApplicationStatus,
);
router.get("/:applicationId", protect, getApplicationById);

export default router;
