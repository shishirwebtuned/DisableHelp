import express from "express";
import {
  createPayment,
  capturePayment,
  getWorkerPaymentDue,
  getPaymentStatus,
  getWorkerPayments,
  getClientPayments,
  getAllPayments,
  getMyPayments,
} from "../controllers/payment.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/all", protect, adminOnly, getAllPayments);
router.post("/create", createPayment);

router.post("/capture", capturePayment);

router.get("/due/:workerId/:clientId", getWorkerPaymentDue);

router.get("/status/:workerId/:clientId", getPaymentStatus);

router.get("/me", protect, getMyPayments);

router.get("/worker/:workerId", getWorkerPayments);

router.get("/client/:clientId", getClientPayments);

export default router;
