import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

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
  const applications = await Application.find()
    .populate("job", "title")
    .populate("applicant", "name email");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Applications retrieved successfully",
    data: applications,
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
  const jobId = req.params.jobId as string;
  const applications = await Application.find({ job: jobId })
    .populate("applicant", "name email")
    .populate("job", "title");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Applications for job retrieved successfully",
    data: applications,
  });
});

export const getApplicationsByApplicantId = catchAsync(async (req, res) => {
  const applicantId = req.params.applicantId as string;
  const applications = await Application.find({ applicant: applicantId })
    .populate("applicant", "name email")
    .populate("job", "title");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Applications for applicant retrieved successfully",
    data: applications,
  });
});

export const updateApplicationStatus = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const clientId = req.user.id;

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const job = await Job.findById(application.job);

  if (!job) {
    throw new AppError("Associated job not found", 404);
  }

  if (job.client.toString() !== clientId) {
    throw new AppError(
      "You are not authorized to update this application",
      403,
    );
  }

  if (!["pending", "accepted", "rejected"].includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  application.status = status;
  await application.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Application status updated successfully",
    data: application,
  });
});
