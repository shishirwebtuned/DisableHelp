import { Agreement } from "../models/agreement.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

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
      message: "No Sessions Found",
      data: [],
    });
  }

  const filter = buildFilter(req.query, { exact: ["status"] });

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
