import express from "express";
import {
  submitContact,
  submitWorkerChange,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/contact", submitContact);

router.post("/change-worker", submitWorkerChange);

export default router;
