import mongoose, { type Date } from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { Agreement } from "../models/agreement.model.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { Notification } from "../models/notification.model.js";

export const createApplication = catchAsync(async (req, res) => {
  const { job, introduction, skills, availability, hourlyRate } = req.body;

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

  const userExists = await User.findById(applicant);

  if (!userExists) {
    throw new AppError("Job not found", 404);
  }

  if (!userExists.approved) {
    throw new AppError(
      "Account not approved yet. Please complete your profile and wait for approval before applying to jobs.",
      403,
    );
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
    hourlyRate,
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
    .populate(
      "applicant",
      "firstName lastName email phoneNumber address approved isNdisProvider",
    )
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
    .populate(
      "applicant",
      "firstName lastName email phoneNumber address approved isNdisProvider",
    );

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
    .populate(
      "applicant",
      "firstName lastName email phoneNumber address approved isNdisProvider",
    )
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
      .populate(
        "applicant",
        "firstName lastName email phoneNumber address approved isNdisProvider",
      )
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

export const acceptApplication = (io: any) =>
  catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    const { applicationId } = req.params;
    const clientId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "client startDate frequency title",
        populate: { path: "client", select: "firstName lastName email" },
      })
      .session(session);

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const job = application.job as unknown as {
      _id: string;
      client: {
        _id: string;
        firstName: string;
        lastName?: string;
        email: string;
      };
      frequency: string;
      startDate: Date;
      title: string;
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

    const createdAgreements = await Agreement.create(
      [
        {
          job: job._id,
          client: job.client._id,
          worker: application.applicant,
          application: application._id,
          hourlyRate: application.hourlyRate,
          startDate: job.startDate,
          schedule: application.availability,
          frequency: job.frequency,
        },
      ] as any[],
      { session },
    );

    const createdAgreement = createdAgreements[0];

    if (!createdAgreement) {
      throw new AppError("Failed to create agreement", 500);
    }

    await createdAgreement.populate([
      { path: "client", select: "firstName lastName email" },
      { path: "worker", select: "firstName lastName email" },
    ]);

    const senderName = `${job.client?.firstName} ${job.client?.lastName}`;
    const acceptedNotification = await Notification.create({
      recipient: application.applicant,
      sender: clientId,
      type: "application",
      title: "Application Accepted",
      actionUrl: "/worker/agreement",
      message: `${senderName} has accepted your application.`,
    });
    io.to(`user:${application.applicant}`).emit(
      "newNotification",
      acceptedNotification,
    );

    const rejectedApps = await Application.find({
      job: job._id,
      _id: { $ne: application._id },
      status: "rejected",
    });

    for (const rejectedApp of rejectedApps) {
      const rejectedNotification = await Notification.create({
        recipient: rejectedApp.applicant,
        sender: clientId,
        type: "application",
        title: "Application Rejected",
        message: `${senderName} has rejected your application.`,
      });
      io.to(`user:${rejectedApp.applicant}`).emit(
        "newNotification",
        rejectedNotification,
      );
    }

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Application accepted and agreement created",
      data: createdAgreement,
    });
  });

export const rejectApplication = (io: any) =>
  catchAsync(async (req, res, next) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    const { applicationId } = req.params;
    const clientId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "client startDate frequency title",
        populate: { path: "client", select: "firstName lastName email" },
      })
      .session(session);

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const job = application.job as unknown as {
      _id: string;
      client: {
        _id: string;
        firstName: string;
        lastName?: string;
        email: string;
      };
      frequency: string;
      startDate: Date;
      title: string;
    };

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.client._id.toString() !== clientId) {
      throw new AppError("Not authorized to accept this application", 403);
    }

    if (application.status !== "pending") {
      throw new AppError("Application already processes", 404);
    }

    application.status = "rejected";
    await application.save({ session });

    const senderName = `${job.client?.firstName} ${job.client?.lastName}`;

    const rejectedNotification = await Notification.create({
      recipient: application.applicant,
      sender: clientId,
      type: "application",
      title: "Application Rejected",
      actionUrl: "/worker/agreement",
      message: `${senderName} has rejected your application.`,
    });

    io.to(`user:${application.applicant}`).emit(
      "newNotification",
      rejectedNotification,
    );

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Application rejected successfully",
      data: application,
    });
  });

export const getMyApplications = catchAsync(async (req, res) => {
  const applicantId = req.user.id;
  const applicantRole = req.user.role;

  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    exact: ["status"],
  });

  if (applicantRole !== "worker") {
    throw new AppError("Only workers can view their applications", 403);
  }

  const query = {
    applicant: applicantId,
    ...filter,
  };

  const applications = await Application.find(query)
    .populate("job", "title startDate frequency")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Application.countDocuments(query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: applications.length
      ? "Applications retrieved successfully"
      : "No applications found",

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
