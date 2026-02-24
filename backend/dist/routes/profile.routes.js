import express from "express";
import { createClientProfile, deleteWorkerFile, getMyProfile, getProfileById, getProfileStatus, updateClientProfile, updateWorkerProfile, upload, } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();
// router.post("/worker", protect, upload, createWorkerProfile);
// router.post("/client", protect, createClientProfile);
router.get("/worker", protect, getMyProfile);
router.get("/me/status", protect, getProfileStatus);
router.get("/:userId", protect, getProfileById);
router.patch("/worker", protect, upload, updateWorkerProfile);
router.delete("/worker/file", protect, deleteWorkerFile);
router.patch("/client", protect, updateClientProfile);
export default router;
//# sourceMappingURL=profile.routes.js.map