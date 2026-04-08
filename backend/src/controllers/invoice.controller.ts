// controllers/invoice.controller.ts
import multer from "multer";
import { Invoice } from "../models/invoice.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { getPagination } from "../utils/queryHelper.js";
import { sendResponse } from "../utils/sendResponse.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";
import type { RequestHandler } from "express";

const storage = multer.memoryStorage();

export const upload: RequestHandler = multer({ storage }).fields([
  { name: "invoiceFile", maxCount: 1 },
]);

export const createInvoice = catchAsync(async (req, res) => {
  const workerId = req.user.id;
  const { client, totalAmount, date, startTime, endTime, notes } = req.body;
  const filesMap = req.files as Record<string, Express.Multer.File[]>;

  const invoiceData: any = {
    worker: workerId,
    client,
    totalAmount,
    notes,
  };

  if (date) invoiceData.date = date;
  if (startTime) invoiceData.startTime = startTime;
  if (endTime) invoiceData.endTime = endTime;

  const invoice = await Invoice.create(invoiceData);

  if (filesMap?.invoiceFile?.[0]) {
    const uploaded = await uploadToCloudinary(
      filesMap.invoiceFile[0].buffer,
      "DisableHelp/invoices",
    );
    invoice.file = {
      url: uploaded.url,
      public_id: uploaded.public_id,
      originalName: filesMap.invoiceFile[0].originalname,
      mimeType: filesMap.invoiceFile[0].mimetype,
    };
    await invoice.save();
  }

  await invoice.populate("client", "firstName lastName email avatar");
  await invoice.populate("worker", "firstName lastName email avatar");

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Invoice created successfully",
    data: { invoice },
  });
});

// Worker: edit invoice (only if pending)
export const editInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const workerId = req.user.id;

  const invoice = await Invoice.findOne({ _id: invoiceId, worker: workerId });
  if (!invoice) throw new AppError("Invoice not found", 404);

  if (invoice.status !== "pending") {
    throw new AppError("Only pending invoices can be edited", 400);
  }

  const { totalAmount, date, startTime, endTime, notes } = req.body;
  const filesMap = req.files as Record<string, Express.Multer.File[]>;

  if (totalAmount !== undefined) invoice.totalAmount = totalAmount;
  if (date !== undefined && date !== "") invoice.date = date;

  if (startTime !== undefined && startTime !== "")
    invoice.startTime = startTime;

  if (endTime !== undefined && endTime !== "") invoice.endTime = endTime;
  if (notes !== undefined) invoice.notes = notes;

  if (filesMap?.invoiceFile?.[0]) {
    // Delete old file if exists
    if (invoice.file?.public_id) {
      const resourceType =
        invoice.file.mimeType === "application/pdf" ? "raw" : "image";
      try {
        await cloudinary.uploader.destroy(invoice.file.public_id, {
          resource_type: resourceType,
        });
      } catch (err) {
        console.warn("Failed to delete old invoice file:", err);
      }
    }

    const uploaded = await uploadToCloudinary(
      filesMap.invoiceFile[0].buffer,
      "DisableHelp/invoices",
    );
    invoice.file = {
      url: uploaded.url,
      public_id: uploaded.public_id,
      originalName: filesMap.invoiceFile[0].originalname,
      mimeType: filesMap.invoiceFile[0].mimetype,
    };
  }

  await invoice.save();

  await invoice.populate("client", "firstName lastName email avatar");
  await invoice.populate("worker", "firstName lastName email avatar");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoice updated successfully",
    data: { invoice },
  });
});

// Worker: delete invoice (only if pending)
export const deleteInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const workerId = req.user.id;

  const invoice = await Invoice.findOne({ _id: invoiceId, worker: workerId });
  if (!invoice) throw new AppError("Invoice not found", 404);

  if (invoice.status !== "pending") {
    throw new AppError("Only pending invoices can be deleted", 400);
  }

  if (invoice.file?.public_id) {
    const resourceType =
      invoice.file.mimeType === "application/pdf" ? "raw" : "image";

    try {
      await cloudinary.uploader.destroy(invoice.file.public_id, {
        resource_type: resourceType,
      });
    } catch (err) {
      console.warn("Failed to delete invoice file:", err);
    }
  }

  await invoice.deleteOne();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoice deleted successfully",
    data: null,
  });
});

export const getMyInvoicesAsWorker = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const workerId = req.user.id;
  const { status } = req.query;

  const filter: any = { worker: workerId };
  if (status) filter.status = status;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate("client", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Your invoices retrieved successfully",
    data: {
      invoices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});

export const getMyInvoicesAsClient = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const clientId = req.user.id;
  const { status } = req.query;

  const filter: any = { client: clientId };
  if (status) filter.status = status;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate("worker", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoices retrieved successfully",
    data: {
      invoices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});

// Client: approve invoice
export const approveInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const clientId = req.user.id;

  const invoice = await Invoice.findOne({ _id: invoiceId, client: clientId });
  if (!invoice) throw new AppError("Invoice not found", 404);

  if (invoice.status !== "pending") {
    throw new AppError("Only pending invoices can be approved", 400);
  }

  invoice.status = "approved";
  invoice.approvedAt = new Date();
  await invoice.save();
  await invoice.populate("worker", "firstName lastName email avatar");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoice approved successfully",
    data: { invoice },
  });
});

// Client: decline invoice
export const declineInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const clientId = req.user.id;
  const { reason } = req.body;

  const invoice = await Invoice.findOne({ _id: invoiceId, client: clientId });
  if (!invoice) throw new AppError("Invoice not found", 404);

  if (invoice.status !== "pending") {
    throw new AppError("Only pending invoices can be declined", 400);
  }

  invoice.status = "declined";
  invoice.declineReason = reason;
  invoice.declinedAt = new Date();
  await invoice.save();
  await invoice.populate("worker", "firstName lastName email avatar");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoice declined",
    data: { invoice },
  });
});

export const adminUpdateInvoiceStatus = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const { status, declineReason } = req.body;

  if (!["approved", "declined"].includes(status)) {
    throw new AppError("Status must be approved or declined", 400);
  }

  if (status === "declined" && !declineReason?.trim()) {
    throw new AppError("Decline reason is required", 400);
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new AppError("Invoice not found", 404);

  const setFields: Record<string, any> =
    status === "approved"
      ? { status: "approved", approvedAt: new Date() }
      : {
          status: "declined",
          declineReason: declineReason.trim(),
          declinedAt: new Date(),
        };

  const unsetFields: Record<string, any> =
    status === "approved"
      ? { declineReason: "", declinedAt: "" }
      : { approvedAt: "" };

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    invoiceId,
    { $set: setFields, $unset: unsetFields },
    { new: true },
  )
    .populate("worker", "firstName lastName email avatar")
    .populate("client", "firstName lastName email avatar");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Invoice ${status} by admin successfully`,
    data: { invoice: updatedInvoice },
  });
});
// Shared: get single invoice
export const getInvoiceById = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user.id;

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    $or: [{ worker: userId }, { client: userId }],
  })
    .populate("worker", "firstName lastName email avatar")
    .populate("client", "firstName lastName email avatar");

  if (!invoice) throw new AppError("Invoice not found", 404);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invoice retrieved successfully",
    data: { invoice },
  });
});

// Admin: get all invoices
export const getAllInvoices = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const filter: any = {};
  if (status) filter.status = status;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate("worker", "firstName lastName email avatar")
      .populate("client", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All invoices retrieved successfully",
    data: {
      invoices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    },
  });
});
