import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { Application } from "../models/application.model.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";

export const createJob = catchAsync(async (req, res) => {
  const {
    startDate,
    frequency,
    location,
    duration,
    title,
    supportDetails,
    jobSessions,
    preference,
    // hourlyRate,
    jobSessionByClient,
  } = req.body;

  const client = req.user.id;

  // Validate required fields (excluding boolean)
  if (
    !startDate ||
    !frequency ||
    !location ||
    !duration ||
    !client ||
    !title ||
    // !hourlyRate ||
    !supportDetails ||
    !preference
  ) {
    throw new AppError("Missing required fields", 400);
  }

  // Validate jobSessions if jobSessionByClient is true
  if (
    jobSessionByClient === true &&
    (!jobSessions || jobSessions.length === 0)
  ) {
    throw new AppError(
      "Job Sessions are required when jobSessionByClient is true",
      400,
    );
  }

  const newJob = new Job({
    startDate,
    frequency,
    location,
    duration,
    client,
    title,
    supportDetails,
    // hourlyRate,
    jobSessions: jobSessions || [], // default empty array if false
    jobSessionByClient: !!jobSessionByClient, // ensure boolean
    preference,
  });

  await newJob.save();

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Job created successfully",
    data: newJob,
  });
});

export const updateJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const updatedData = req.body;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  Object.assign(job, updatedData);

  await job.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job updated successfully",
    data: job,
  });
});

export const deleteJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  if (Array.isArray(jobId)) {
    throw new AppError("Invalid job id", 400);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const hasApplications = await Application.exists({
    job: new mongoose.Types.ObjectId(jobId),
  });

  if (hasApplications) {
    throw new AppError(
      "Job cannot be deleted because workers have already applied",
      400,
    );
  }

  await job.deleteOne();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job deleted successfully",
  });
});

export const getAllJobs = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["title", "frequency"],
    exact: ["status"],
    range: ["hourlyRate", "startDate"],
  });

  const jobs = await Job.find(filter)
    .populate("client", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!jobs || jobs.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Jobs Found",
      data: [],
    });
  }

  const jobIds = jobs.map((job) => job._id);

  const applicationCounts = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
      },
    },
    {
      $group: {
        _id: "$job",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    applicationCounts.map((item) => [item._id.toString(), item.count]),
  );

  const jobsData = jobs.map((job) => ({
    ...job,
    applicationCount: countMap.get(job._id.toString()) || 0,
  }));

  const total = await Job.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: {
      jobsData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getJobById = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId)
    .populate("client", "firstName lastName email")
    .lean();

  if (!job) {
    throw new AppError("No job Found", 404);
  }

  const applicationCount = await Application.countDocuments({
    job: job._id,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job fetched successfully",
    data: {
      ...job,
      applicationCount,
    },
  });
});

export const getJobsByClient = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["title", "frequency"],
    exact: ["status"],
    range: ["hourlyRate", "startDate"],
  });

  const { clientId } = req.params;

  if (!clientId) {
    throw new AppError("Client ID is required", 400);
  }

  const jobs = await Job.find({ client: clientId })
    .populate("client", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!jobs || jobs.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Jobs Found",
      data: [],
    });
  }

  const jobIds = jobs.map((job) => job._id);

  const applicationCounts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: "$job",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    applicationCounts.map((item) => [item._id.toString(), item.count]),
  );

  const jobsData = jobs.map((job) => ({
    ...job,
    applicationCount: countMap.get(job._id.toString()) || 0,
  }));

  const total = await Job.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: {
      jobsData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getMyJobs = catchAsync(async (req, res) => {
  const clientId = req.user!.id;

  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["title", "frequency"],
    exact: ["status"],
    range: ["hourlyRate", "startDate"],
  });
  console.log("Client ID:", clientId);

  if (!clientId || typeof clientId !== "string") {
    throw new AppError("Invalid user id", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new AppError("Invalid user id format", 400);
  }

  const jobs = await Job.find({ client: clientId })
    .populate("client", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean()
    .limit(limit)
    .skip(skip);

  if (!jobs || jobs.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No jobs Found",
      data: [],
    });
  }

  const jobIds = jobs.map((job) => job._id);

  const applicationCounts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: "$job",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    applicationCounts.map((item) => [item._id.toString(), item.count]),
  );

  const jobsData = jobs.map((job) => ({
    ...job,
    applicationCount: countMap.get(job._id.toString()) || 0,
  }));

  const total = await Job.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: {
      jobsData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
