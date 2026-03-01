import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { Agreement } from "../models/agreement.model.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

export const createApplication = catchAsync(async (req, res) => {
  const { job, introduction, skills, availability } = req.body;

  const applicant = req.user.id;
  const role = req.user.role;

  if (role !== "worker") {
    throw new AppError("Only worker can apply to jobs", 403);
  }

  if (
    !job ||
    !introduction ||
    !skills ||
    !Array.isArray(availability) ||
    availability.length === 0
  ) {
    throw new AppError("Missing required fields", 400);
  }

  const jobExists = await Job.findById(job);

  if (!jobExists) {
    throw new AppError("Job not found", 404);
  }

  const existingApplication = await Application.findOne({
    job,
    applicant,
  });

  if (existingApplication) {
    throw new AppError("You already applied to this job", 400);
  }

  const application = await Application.create({
    job,
    applicant,
    introduction,
    skills,
    availability,
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Application created successfully",
    data: application,
  });
});

export const getAllApplications = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });

  const applications = await Application.find()
    .populate("job", "title")
    .populate("applicant", "name email")
    .sort({ createdAt: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!applications || applications.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Applications Found",
      data: [],
    });
  }
  const total = await Application.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Applications retrieved successfully",
    data: {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getApplicationById = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const application = await Application.findById(applicationId)
    .populate("job", "title")
    .populate("applicant", "name email");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Application retrieved successfully",
    data: application,
  });
});

export const getApplicationsByJobId = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });
  const jobId = req.params.jobId as string;

  const applications = await Application.find({ job: jobId })
    .populate("applicant", "name email")
    .populate("job", "title")
    .sort({ createdAt: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!applications || applications.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Applications Found",
      data: [],
    });
  }
  const total = await Application.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Applications retrieved successfully",
    data: {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getApplicationsByApplicantId = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });

  const applicantId = req.params.applicantId as string;

  const finalFilter = {
    applicant: applicantId,
    ...filter,
  };

  const [applications, total, statusCounts] = await Promise.all([
    Application.find(finalFilter)
      .populate("applicant", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .lean()
      .limit(limit)
      .skip(skip),

    Application.countDocuments(finalFilter),

    Application.aggregate([
      {
        $match: {
          applicant: new mongoose.Types.ObjectId(applicantId),
          ...filter,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  let totalPending = 0;
  let totalAccepted = 0;
  let totalRejected = 0;

  (statusCounts as { _id: string; count: number }[]).forEach((item) => {
    if (item._id === "pending") totalPending = item.count;
    if (item._id === "accepted") totalAccepted = item.count;
    if (item._id === "rejected") totalRejected = item.count;
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message:
      applications.length > 0
        ? "Applications for applicant retrieved successfully"
        : "No Applications Found",
    data: {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalPending,
        totalAccepted,
        totalRejected,
      },
    },
  });
});

export const acceptApplication = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const { applicationId } = req.params;
  const clientId = req.user.id;

  const application = await Application.findById(applicationId)
    .populate({
      path: "job",
      select: "client hourlyRate",
      populate: { path: "client", select: "name email" },
    })
    .session(session);

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const job = application.job as unknown as {
    _id: string;
    client: { _id: string; name: string; email: string };
    hourlyRate: number;
  };

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.client._id.toString() !== clientId) {
    throw new AppError("Not authorized to accept this application", 403);
  }

  if (application.status !== "pending") {
    throw new AppError("Application already processed", 400);
  }

  application.status = "accepted";
  await application.save({ session });

  await Application.updateMany(
    {
      job: job._id,
      _id: { $ne: application._id },
      status: "pending",
    },
    { $set: { status: "rejected" } },
    { session },
  );

  const [createdAgreement] = await Agreement.create(
    [
      {
        job: job._id,
        client: job.client._id,
        worker: application.applicant,
        application: application._id,
        hourlyRate: job.hourlyRate,
        startDate: new Date(),
      },
    ],
    { session },
  );

  if (!createdAgreement) {
    throw new AppError("Failed to create agreement", 500);
  }

  await createdAgreement.populate([
    { path: "client", select: "name email" },
    { path: "worker", select: "name email" },
  ]);

  await session.commitTransaction();
  session.endSession();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Application accepted and agreement created",
    data: createdAgreement,
  });
});
