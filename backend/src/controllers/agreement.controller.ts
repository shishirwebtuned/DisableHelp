import { get } from "node:http";
import { Agreement } from "../models/agreement.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

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

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement accepted successfully",
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

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement terminated successfully",
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
