import mongoose from "mongoose";
import { Payment, type IPayment } from "../models/payment.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { calculatePaymentDue } from "../utils/PaymentDue.js";
import {
  capturePayPalOrder,
  createPayPalOrder,
} from "../utils/PaypalService.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

export const createPayment = catchAsync(async (req, res) => {
  const { workerId, clientId, paymentMethod } = req.body;

  if (!workerId || !clientId || !paymentMethod) {
    throw new AppError("Missing required fields", 400);
  }

  if (
    !mongoose.Types.ObjectId.isValid(workerId) ||
    !mongoose.Types.ObjectId.isValid(clientId)
  ) {
    throw new AppError("Invalid worker or client ID", 400);
  }

  const lastPayment: IPayment | null = await Payment.findOne({
    worker: workerId,
    client: clientId,
    status: "successful",
  }).sort({ paymentDate: -1 });

  const paymentDue = calculatePaymentDue(lastPayment);

  const order = await createPayPalOrder(paymentDue.amountDue);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "PayPal order created successfully. Complete payment on PayPal.",
    data: {
      orderId: order.id,
      approveLink: order.links.find((l: any) => l.rel === "approve")?.href,
      amountDue: paymentDue.amountDue,
    },
  });
});

export const capturePayment = catchAsync(async (req, res) => {
  const { orderId, workerId, clientId, paymentMethod } = req.body;

  if (!orderId || !workerId || !clientId || !paymentMethod) {
    throw new AppError("Missing required fields", 400);
  }

  const captureResult = await capturePayPalOrder(orderId);

  if (captureResult.status !== "COMPLETED") {
    throw new AppError("Payment not completed", 400);
  }

  const lastPayment: IPayment | null = await Payment.findOne({
    worker: workerId,
    client: clientId,
    status: "successful",
  }).sort({ paymentDate: -1 });

  const paymentDue = calculatePaymentDue(lastPayment);
  const today = new Date();
  const nextPaymentDate = new Date(today);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  const payment = new Payment({
    worker: workerId,
    client: clientId,
    amount: paymentDue.baseAmount,
    lateFee: paymentDue.lateFee,
    totalAmount: paymentDue.amountDue,
    paymentDate: today,
    nextPaymentDate,
    status: "successful",
    paymentMethod,
    paymentReference: orderId,
  });

  await payment.save();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Payment captured and recorded successfully",
    data: payment,
  });
});

export const getWorkerPaymentDue = catchAsync(async (req, res) => {
  const workerId = req.params.workerId as string;
  const clientId = req.params.clientId as string;

  if (
    !mongoose.Types.ObjectId.isValid(workerId) ||
    !mongoose.Types.ObjectId.isValid(clientId)
  ) {
    throw new AppError("Invalid worker or client ID", 400);
  }

  const lastPayment: IPayment | null = await Payment.findOne({
    worker: workerId,
    client: clientId,
    status: "successful",
  })
    .sort({ paymentDate: -1 })
    .exec();

  const paymentDue = calculatePaymentDue(lastPayment);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payment due fetched successfully",
    data: paymentDue,
  });
});

export const getPaymentStatus = catchAsync(async (req, res) => {
  const workerId = req.params.workerId as string;
  const clientId = req.params.clientId as string;

  if (
    !mongoose.Types.ObjectId.isValid(workerId) ||
    !mongoose.Types.ObjectId.isValid(clientId)
  ) {
    throw new AppError("Invalid worker or client ID", 400);
  }

  const lastPayment: IPayment | null = await Payment.findOne({
    worker: workerId,
    client: clientId,
    status: "successful",
  })
    .sort({ paymentDate: -1 })
    .exec();

  const paymentStatus = calculatePaymentDue(lastPayment);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payment status fetched successfully",
    data: paymentStatus,
  });
});

export const getWorkerPayments = catchAsync(async (req, res) => {
  const workerId = req.params.workerId as string;
  const { page, limit, skip } = getPagination(req.query);

  if (!mongoose.Types.ObjectId.isValid(workerId))
    throw new AppError("Invalid worker ID", 400);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });
  const query = {
    worker: workerId,
    ...filter,
  };

  const payments = await Payment.find(query)
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate("worker", "firstName lastName email")
    .populate("client", "firstName lastName email")
    .lean()
    .exec();

  const total = await Payment.countDocuments(query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Worker payments fetched successfully",
    data: {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit ? Math.ceil(total / limit) : 0,
      },
    },
  });
});

export const getClientPayments = catchAsync(async (req, res) => {
  const clientId = req.params.clientId as string;
  if (!mongoose.Types.ObjectId.isValid(clientId))
    throw new AppError("Invalid client ID", 400);

  const payments = await Payment.find({ client: clientId })
    .sort({ paymentDate: -1 })
    .exec();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client payments fetched successfully",
    data: payments,
  });
});

export const getMyPayments = catchAsync(async (req, res) => {
  const workerId = req.user.id;
  const { page, limit, skip } = getPagination(req.query);

  if (!mongoose.Types.ObjectId.isValid(workerId))
    throw new AppError("Invalid user ID", 400);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });

  const query = {
    worker: workerId,
    ...filter,
  };

  const payments = await Payment.find(query)
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate("worker", "firstName lastName email")
    .populate("client", "firstName lastName email")
    .lean()
    .exec();

  const total = await Payment.countDocuments(query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "My payments fetched successfully",
    data: {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit ? Math.ceil(total / limit) : 0,
      },
    },
  });
});

export const getAllPayments = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });

  const payments = await Payment.find(filter)
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate("worker", "firstName lastName email")
    .populate("client", "firstName lastName email")
    .lean()
    .exec();

  const total = await Payment.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All payments fetched successfully",
    data: {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit ? Math.ceil(total / limit) : 0,
      },
    },
  });
});
