import express from "express";
import { clientOnly, protect } from "../middleware/auth.middleware.js";
import { acceptApplication, createApplication, getAllApplications, getApplicationById, getApplicationsByApplicantId, getApplicationsByJobId, } from "../controllers/application.controller.js";
const router = express.Router();
router.post("/", protect, createApplication);
router.get("/applicant/:applicantId", protect, getApplicationsByApplicantId);
router.get("/job/:jobId", protect, getApplicationsByJobId);
router.get("/", protect, getAllApplications);
router.patch("/:applicationId/accept", protect, clientOnly, acceptApplication);
router.get("/:applicationId", protect, getApplicationById);
export default router;
//# sourceMappingURL=application.routes.js.map