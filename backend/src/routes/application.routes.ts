import express from "express";
import { clientOnly, protect } from "../middleware/auth.middleware.js";
import {
  acceptApplication,
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByApplicantId,
  getApplicationsByJobId,
  rejectApplication,
} from "../controllers/application.controller.js";

const router = express.Router();

export const initApplicationRoutes = (io: any) => {
  router.post("/", protect, createApplication);

  router.get("/applicant/:applicantId", protect, getApplicationsByApplicantId);
  router.get("/job/:jobId", protect, getApplicationsByJobId);

  router.get("/", protect, getAllApplications);
  router.patch(
    "/:applicationId/accept",
    protect,
    clientOnly,
    acceptApplication(io),
  );
  router.patch(
    "/:applicationId/reject",
    protect,
    clientOnly,
    rejectApplication(io),
  );
  router.get("/:applicationId", protect, getApplicationById);

  return router;
};
export default router;
