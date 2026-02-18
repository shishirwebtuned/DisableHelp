import express from "express";
import { createClientProfile, createWorkerProfile, getMyProfile, getProfileById, getProfileStatus, updateClientProfile, updateWorkerProfile, upload, } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();
// router.post("/worker", protect, upload, createWorkerProfile);
// router.post("/client", protect, createClientProfile);
router.get("/worker", protect, getMyProfile);
router.get("/:userId", protect, getProfileById);
router.get("/status", getProfileStatus);
router.patch("/worker", protect, upload, updateWorkerProfile);
router.patch("/client", protect, updateClientProfile);
export default router;
//# sourceMappingURL=profile.routes.js.map