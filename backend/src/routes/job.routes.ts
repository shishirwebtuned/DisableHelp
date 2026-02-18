import express from "express";
import { clientOnly, protect } from "../middleware/auth.middleware.js";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getJobsByClient,
  getMyJobs,
  updateJob,
} from "../controllers/job.controller.js";

const router = express.Router();

// CREATE / UPDATE
router.post("/", protect, clientOnly, createJob);
router.put("/:jobId", protect, clientOnly, updateJob);
router.delete("/:jobId", protect, clientOnly, deleteJob);

// SPECIAL ROUTES
router.get("/client", protect, clientOnly, getMyJobs);
router.get("/client/:clientId", protect, getJobsByClient);

// GENERAL ROUTES
router.get("/", getAllJobs);
router.get("/:jobId", protect, getJobById);

export default router;
