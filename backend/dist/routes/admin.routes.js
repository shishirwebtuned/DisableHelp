import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import { approveUser } from "../controllers/admin.controller.js";
const router = express.Router();
router.patch("/approve/:userId", protect, adminOnly, approveUser);
export default router;
//# sourceMappingURL=admin.routes.js.map