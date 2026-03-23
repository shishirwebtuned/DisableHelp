// routes/invoice.routes.ts
import express from "express";
import {
  createInvoice,
  editInvoice,
  deleteInvoice,
  getMyInvoicesAsWorker,
  getMyInvoicesAsClient,
  approveInvoice,
  declineInvoice,
  getInvoiceById,
  getAllInvoices,
  adminUpdateInvoiceStatus,
  upload,
} from "../controllers/invoice.controller.js";
import {
  adminOnly,
  clientOnly,
  protect,
  workerOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Worker
router.post("/", upload, protect, workerOnly, createInvoice);
router.put("/:invoiceId", upload, protect, workerOnly, editInvoice);
router.delete("/:invoiceId", protect, deleteInvoice);
router.get("/my/worker", protect, workerOnly, getMyInvoicesAsWorker);

// Client
router.get("/my/client", protect, clientOnly, getMyInvoicesAsClient);
router.patch("/:invoiceId/approve", protect, approveInvoice);
router.patch("/:invoiceId/decline", protect, declineInvoice);
router.patch(
  "/:invoiceId/admin-status",
  protect,
  adminOnly,
  adminUpdateInvoiceStatus,
);

// Shared
router.get("/:invoiceId", getInvoiceById);

// Admin
router.get("/", protect, adminOnly, getAllInvoices);

export default router;
