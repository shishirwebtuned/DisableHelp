import express from "express";
import {
  createWorkerProfile,
  upload,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/worker", protect, upload, createWorkerProfile);

export default router;
