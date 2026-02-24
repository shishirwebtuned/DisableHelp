import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import { createService, deleteService, getAllServices, getServiceById, updateService, } from "../controllers/service.controller.js";
const router = express.Router();
router.post("", protect, adminOnly, createService);
router.put("/:serviceId", protect, adminOnly, updateService);
router.delete("/:serviceId", protect, adminOnly, deleteService);
router.get("/:serviceId", protect, adminOnly, getServiceById);
router.get("", protect, getAllServices);
export default router;
//# sourceMappingURL=service.routes.js.map