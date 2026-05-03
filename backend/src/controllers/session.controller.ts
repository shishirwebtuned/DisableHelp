import { Agreement } from "../models/agreement.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

export const createSession = catchAsync(async (req, res) => {
  const { agreementId, startDate, endDate } = req.body;

  if (!agreementId || !startDate || !endDate) {
    throw new AppError(
      "Agreement ID, start date, and end date are required",
      400,
    );
  }

  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  if (agreement.status !== "active") {
    throw new AppError("Agreement is not active", 400);
  }
});

export const getSessionsByUserId = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const userId = req.user.id;
  const userRole = req.user.role;

  if (!userId) {
    throw new AppError("user ID is required", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User not found",
    });
  }

  const filter = buildFilter(req.query, { exact: ["client", "job", "worker"] });

  let finalFilter: any = {};

  if (userRole === "worker") {
    finalFilter = {
      worker: userId,
      ...filter,
    };
  } else {
    finalFilter = {
      client: userId,
      ...filter,
    };
  }

  const sessions = await Session.find(finalFilter)
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("job", "title")
    .sort({ date: 1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!sessions || sessions.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Sessions Found",
      data: [],
    });
  }

  const total = await Session.countDocuments(finalFilter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Sessions retrieved successfully",
    data: {
      sessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getSessionsByAgreementId = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const agreementId = req.params.agreementId as string;

  if (!agreementId) {
    throw new AppError("Agreement ID is required", 400);
  }

  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Agreement Found",
      data: [],
    });
  }

  const filter = buildFilter(req.query, { exact: ["client", "job", "worker"] });

  const finalFilter = {
    agreement: agreementId,
    ...filter,
  };

  const sessions = await Session.find(finalFilter)
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("job", "title")
    .sort({ date: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!sessions || sessions.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Sessions Found",
      data: [],
    });
  }

  const total = await Session.countDocuments(finalFilter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Sessions retrieved successfully",
    data: {
      sessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getSessionById = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new AppError("Session Id is required", 400);
  }

  const session = await Session.findById(sessionId)
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .populate("job", "title")
    .populate("agreement")
    .lean();

  if (!session) {
    throw new AppError("Session not found", 400);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Session data retrieved successfully",
    data: {
      session,
    },
  });
});

export const cancelSession = (io: any) =>
  catchAsync(async (req, res) => {
    const { sessionId } = req.params;
    const { cancelledReason } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    if (!sessionId) {
      throw new AppError("Agreement ID is required", 400);
    }

    if (!cancelledReason) {
      throw new AppError("Cancellation reason is required", 400);
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      throw new AppError("Session not found", 400);
    }

    if (
      session.client.toString() !== userId &&
      session.worker.toString() !== userId &&
      userRole !== "admin"
    ) {
      throw new AppError("You are not authorized to cancel this session", 403);
    }

    if (session.status !== "scheduled") {
      throw new AppError("Only Scheduled Session can be cancelled", 400);
    }

    session.status = "cancelled";
    session.cancelledBy = userId;
    session.cancelledReason = cancelledReason;
    session.cancelledByRole = userRole;
    session.cancelledAt = new Date();

    await session.save();

    const senderName = `${req?.user?.firstName} ${req?.user?.lastName}`;

    const cancellerRole =
      session.worker.toString() === userId ? "worker" : "client";
    const recipientId =
      cancellerRole === "worker" ? session.client : session.worker;

    const recipientRole = cancellerRole === "worker" ? "client" : "worker";

    const notificationMessage =
      cancellerRole === "worker"
        ? `Your session scheduled on ${session.date.toDateString()} has been cancelled by the worker (${senderName}).`
        : `Your session scheduled on ${session.date.toDateString()} has been cancelled by the client (${senderName}).`;

    const cancelledNotification = await Notification.create({
      recipient: recipientId,
      sender: userId,
      type: "session",
      title: "Session Cancelled",
      message: notificationMessage,
      actionUrl: `/${recipientRole}/sessions`,
    });

    io.to(`user:${recipientId}`).emit("newNotification", cancelledNotification);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Session cancelled successfully",
      data: session,
    });
  });
