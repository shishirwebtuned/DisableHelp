import express from "express";
import {
  createPayment,
  capturePayment,
  getWorkerPaymentDue,
  getPaymentStatus,
  getWorkerPayments,
  getClientPayments,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", createPayment);

router.post("/capture", capturePayment);

router.get("/due/:workerId/:clientId", getWorkerPaymentDue);

router.get("/status/:workerId/:clientId", getPaymentStatus);

router.get("/worker/:workerId", getWorkerPayments);

router.get("/client/:clientId", getClientPayments);

export default router;
