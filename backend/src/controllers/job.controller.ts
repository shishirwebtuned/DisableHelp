import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

export const createJob = catchAsync(async (req, res) => {
  const {
    startDate,
    frequency,
    location,
    duration,
    client,
    title,
    supportDetails,
    jobSessions,
    preference,
  } = req.body;

  if (
    !startDate ||
    !frequency ||
    !location ||
    !duration ||
    !client ||
    !title ||
    !supportDetails ||
    !jobSessions ||
    !preference
  ) {
    throw new AppError("Missing required fields", 400);
  }

  const newJob = new Job({
    startDate,
    frequency,
    location,
    duration,
    client,
    title,
    supportDetails,
    jobSessions,
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

  const job = await Job.findByIdAndDelete(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job deleted successfully",
  });
});

export const getAllJobs = catchAsync(async (req, res) => {
  const jobs = await Job.find({}).sort({ createdAt: -1 });

  if (!jobs || jobs.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No Jobs Found",
      data: [],
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: jobs,
  });
});

export const getJobById = catchAsync(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("No job Found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job fetched successfully",
    data: job,
  });
});

export const getJobsByClient = catchAsync(async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    throw new AppError("Client ID is required", 400);
  }

  const job = await Job.find({ client: clientId });

  if (!job || job.length === 0) {
    throw new AppError("No job Found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: job,
  });
});

export const getMyJobs = catchAsync(async (req, res) => {
  const clientId = req.user!.id;

  console.log("Client ID:", clientId);

  if (!clientId || typeof clientId !== "string") {
    throw new AppError("Invalid user id", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new AppError("Invalid user id format", 400);
  }

  if (!clientId) {
    throw new AppError("Client ID is required", 400);
  }

  const job = await Job.find({ client: clientId });

  if (!job || job.length === 0) {
    throw new AppError("No job Found", 404);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Jobs fetched successfully",
    data: job,
  });
});
