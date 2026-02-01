import express from "express";
import { adminOnly, protect } from "../middleware/auth.middleware.js";
import { loginUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", loginUser);

export default router;
