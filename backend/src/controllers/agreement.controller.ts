import { Agreement } from "../models/agreement.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { Session } from "../models/session.model.js";
import { generateSessionsFromSchedule } from "../utils/sessionGenerator.js";
import { Chat } from "../models/chat.model.js";

export const acceptAgreementByWorker = catchAsync(async (req, res) => {
  const { agreementId } = req.params;

  const workerId = req.user.id;

  const agreement = await Agreement.findById(agreementId);

  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  if (agreement.worker.toString() !== workerId) {
    throw new AppError("You are not authorized to accept this agreement", 403);
  }

  if (agreement.status !== "pending")
    throw new AppError("Agreement already processed", 400);

  agreement.status = "active";
  agreement.termsAcceptedByWorker = true;
  agreement.termsAcceptedAt = new Date();

  await agreement.save();

  const clientId = agreement.client;
  const rawWorkerId = agreement.worker;

  await agreement.populate([
    { path: "client", select: "firstName lastName email phoneNumber" },
    { path: "worker", select: "firstName lastName email phoneNumber" },
    { path: "job", select: "title" },
  ]);

  await generateSessionsFromSchedule(agreement);

  await Chat.findOneAndUpdate(
    { client: clientId, worker: rawWorkerId },
    {
      $setOnInsert: {
        client: clientId,
        worker: rawWorkerId,
      },
      $set: {
        agreement: agreement._id,
        status: "active",
      },
    },
    { upsert: true, new: true },
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement accepted and sessions generated successfully",
    data: agreement,
  });
});

export const terminateAgreement = catchAsync(async (req, res) => {
  const { agreementId } = req.params;

  if (!req.body || !req.body.terminationReason) {
    throw new AppError("Termination reason is required", 400);
  }

  const { terminationReason } = req.body;

  if (!terminationReason) {
    throw new AppError("Termination reason is required", 400);
  }

  const userId = req.user.id;
  const userRole = req.user.role;

  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  if (
    agreement.client.toString() !== userId &&
    agreement.worker.toString() !== userId
  ) {
    throw new AppError(
      "You are not authorized to terminate this agreement",
      403,
    );
  }

  if (agreement.status !== "active") {
    throw new AppError("Only active agreements can be terminated", 400);
  }

  agreement.status = "terminated";
  agreement.terminatedBy = userId;
  agreement.terminatedByRole = userRole;
  agreement.terminationReason = terminationReason;
  agreement.terminatedAt = new Date();

  await agreement.save();

  await agreement.populate([
    { path: "client", select: "firstName lastName email phoneNumber" },
    { path: "worker", select: "firstName lastName email phoneNumber" },
    { path: "job", select: "title" },
  ]);

  await Session.updateMany(
    {
      agreement: agreement._id,
      startTime: { $gte: new Date() },
      status: { $in: ["scheduled", "in-progress"] },
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy: userId,
        cancelledAt: new Date(),
        notes: `Session cancelled due to agreement termination: ${terminationReason}`,
      },
    },
  );

  const chat = await Chat.findOne({ agreement: agreement._id });
  if (chat) {
    chat.status = "suspended";
    await chat.save();
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement terminated and future sessions cancelled successfully",
    data: agreement,
  });
});

export const getAllAgreements = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["status"],
    exact: [],
    range: [],
  });

  const agreements = await Agreement.find(filter)
    .populate("job", "title")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!agreements || agreements.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Agreements Found",
      data: [],
    });
  }
  const total = await Agreement.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreements retrieved successfully",
    data: {
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgreementById = catchAsync(async (req, res) => {
  const { agreementId } = req.params;

  const agreement = await Agreement.findById(agreementId)
    .populate("job", "title")
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .sort({ createdAt: -1 });

  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Agreement retrieved successfully",
    data: agreement,
  });
});

export const getAgreementsByClient = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["status"],
    exact: [],
    range: [],
  });

  const clientId = req.user.id;

  const agreements = await Agreement.find({ ...filter, client: clientId })
    .populate("job", "title")
    .populate(
      "worker",
      "firstName lastName email dateOfBirth phoneNumber address",
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!agreements || agreements.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Agreements Found for this client",
      data: [],
    });
  }

  const total = await Agreement.countDocuments({ ...filter, client: clientId });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreements retrieved successfully",
    data: {
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgreementsByWorker = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["status"],
    exact: [],
    range: [],
  });

  const workerId = req.user.id;

  const agreements = await Agreement.find({ ...filter, worker: workerId })
    .populate("job", "title")
    .populate(
      "client",
      "firstName lastName email address dateOfBirth phoneNumber",
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!agreements || agreements.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Agreements Found for this worker",
      data: [],
    });
  }

  const total = await Agreement.countDocuments({ ...filter, worker: workerId });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreements retrieved successfully",
    data: {
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getAgreementByJob = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["status"],
    exact: [],
    range: [],
  });

  const { jobId } = req.params;
  const agreements = await Agreement.find({ ...filter, job: jobId })
    .populate("client", "firstName lastName email")
    .populate("worker", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!agreements || agreements.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Agreements Found for this job",
      data: [],
    });
  }

  const total = await Agreement.countDocuments({ ...filter, job: jobId });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement retrieved successfully",
    data: {
      agreements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
