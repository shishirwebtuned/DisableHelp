// controllers/invoice.controller.ts
import { Invoice } from "../models/invoice.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { getPagination } from "../utils/queryHelper.js";
import { sendResponse } from "../utils/sendResponse.js";

export const createInvoice = catchAsync(async (req, res) => {
  const workerId = req.user.id;
  const { client, totalAmount, date, startTime, endTime, notes } = req.body;

  const invoice = await Invoice.create({
    worker: workerId,
    client,
    totalAmount,
    date,
    startTime,
    endTime,
    notes,
  });

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

  if (totalAmount !== undefined) invoice.totalAmount = totalAmount;
  if (date !== undefined) invoice.date = date;
  if (startTime !== undefined) invoice.startTime = startTime;
  if (endTime !== undefined) invoice.endTime = endTime;
  if (notes !== undefined) invoice.notes = notes;

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
  const workerId = req.user._id;

  const invoice = await Invoice.findOne({ _id: invoiceId, worker: workerId });
  if (!invoice) throw new AppError("Invoice not found", 404);

  if (invoice.status !== "pending") {
    throw new AppError("Only pending invoices can be deleted", 400);
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
