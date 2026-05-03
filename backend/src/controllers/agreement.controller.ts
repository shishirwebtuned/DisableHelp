import { Agreement } from "../models/agreement.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { Session } from "../models/session.model.js";
import { generateSessionsFromSchedule } from "../utils/sessionGenerator.js";
import { Chat } from "../models/chat.model.js";
import mongoose from "mongoose";

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
    {
      path: "client",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
    {
      path: "worker",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
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
    {
      path: "client",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
    {
      path: "worker",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
    { path: "job", select: "title" },
  ]);

  await Session.updateMany(
    {
      agreement: agreement._id,
      date: { $gte: new Date() },
      status: { $in: ["scheduled", "in-progress"] },
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy: userId,
        cancelledByRole: userRole,
        cancelledAt: new Date(),
        cancelledReason: "Session cancelled due to agreement termination.",
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
    .populate(
      "client",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
    .populate(
      "worker",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
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
    .populate("job", "title location supportDetails")
    .populate(
      "client",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
    .populate(
      "worker",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
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

// export const getAgreementsByClient = catchAsync(async (req, res) => {
//   const { page, limit, skip } = getPagination(req.query);

//   const filter = buildFilter(req.query, {
//     searchFields: ["status"],
//     exact: [],
//     range: [],
//   });

//   const clientId = req.user.id;

//   const agreements = await Agreement.find({ ...filter, client: clientId })
//     .populate("job", "title")
//     .populate(
//       "worker",
//       "firstName lastName email dateOfBirth phoneNumber address",
//     )
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   if (!agreements || agreements.length === 0) {
//     return sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: "No Agreements Found for this client",
//       data: [],
//     });
//   }

//   const total = await Agreement.countDocuments({ ...filter, client: clientId });

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Agreements retrieved successfully",
//     data: {
//       agreements,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     },
//   });
// });

export const getAgreementsByClient = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search as string;
  const status = req.query.status as string;

  const clientId = req.user.id;

  let matchStage: any = {
    client: new mongoose.Types.ObjectId(clientId),
  };

  if (status && status !== "all") {
    matchStage.status = status;
  }

  const pipeline: any[] = [
    { $match: matchStage },

    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job",
      },
    },

    { $unwind: "$job" },

    {
      $lookup: {
        from: "users",
        localField: "worker",
        foreignField: "_id",
        as: "worker",
      },
    },

    { $unwind: "$worker" },

    {
      $lookup: {
        from: "users",
        localField: "client",
        foreignField: "_id",
        as: "client",
      },
    },

    { $unwind: "$client" },
  ];

  // SEARCH
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: search,
                options: "i",
              },
            },
          },
          { "job.title": { $regex: search, $options: "i" } },

          { "worker.firstName": { $regex: search, $options: "i" } },

          { "worker.lastName": { $regex: search, $options: "i" } },

          { "client.firstName": { $regex: search, $options: "i" } },

          { "client.lastName": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // PAGINATION
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  );

  const agreements = await Agreement.aggregate(pipeline);

  const totalPipeline = [...pipeline.filter((p) => !p.$skip && !p.$limit)];

  totalPipeline.push({ $count: "total" });

  const totalResult = await Agreement.aggregate(totalPipeline);

  const total = totalResult[0]?.total || 0;

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

// export const getAgreementsByWorker = catchAsync(async (req, res) => {
//   const { page, limit, skip } = getPagination(req.query);

//   const filter = buildFilter(req.query, {
//     searchFields: ["status"],
//     exact: [],
//     range: [],
//   });

//   const workerId = req.user.id;

//   const agreements = await Agreement.find({ ...filter, worker: workerId })
//     .populate("job", "title")
//     .populate(
//       "client",
//       "firstName lastName email address dateOfBirth phoneNumber",
//     )
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   if (!agreements || agreements.length === 0) {
//     return sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: "No Agreements Found for this worker",
//       data: [],
//     });
//   }

//   const total = await Agreement.countDocuments({ ...filter, worker: workerId });

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Agreements retrieved successfully",
//     data: {
//       agreements,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     },
//   });
// });

export const getAgreementsByWorker = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const search = req.query.search as string;
  const status = req.query.status as string;

  const workerId = req.user.id;

  let matchStage: any = {
    worker: new mongoose.Types.ObjectId(workerId),
  };

  if (status && status !== "all") {
    matchStage.status = status;
  }

  const pipeline: any[] = [
    { $match: matchStage },

    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job",
      },
    },

    { $unwind: "$job" },

    {
      $lookup: {
        from: "users",
        localField: "worker",
        foreignField: "_id",
        as: "worker",
      },
    },

    { $unwind: "$worker" },

    {
      $lookup: {
        from: "users",
        localField: "client",
        foreignField: "_id",
        as: "client",
      },
    },

    { $unwind: "$client" },
  ];

  // SEARCH
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: search,
                options: "i",
              },
            },
          },
          { "job.title": { $regex: search, $options: "i" } },

          { "worker.firstName": { $regex: search, $options: "i" } },

          { "worker.lastName": { $regex: search, $options: "i" } },

          { "client.firstName": { $regex: search, $options: "i" } },

          { "client.lastName": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  );

  const agreements = await Agreement.aggregate(pipeline);

  const totalPipeline = [...pipeline.filter((p) => !p.$skip && !p.$limit)];

  totalPipeline.push({ $count: "total" });

  const totalResult = await Agreement.aggregate(totalPipeline);

  const total = totalResult[0]?.total || 0;

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
    .populate(
      "client",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
    .populate(
      "worker",
      "firstName lastName email phoneNumber dateOfBirth address",
    )
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

export const editAgreement = catchAsync(async (req, res) => {
  const { agreementId } = req.params;
  const { schedule, startDate } = req.body;

  const allowedUpdates = ["schedule", "startDate"];
  const invalidFields = Object.keys(req.body).filter(
    (field) => !allowedUpdates.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new AppError(
      `Only schedule and startDate can be edited. Invalid fields: ${invalidFields.join(", ")}`,
      400,
    );
  }

  if (schedule === undefined && startDate === undefined) {
    throw new AppError(
      "At least one of schedule or startDate must be provided",
      400,
    );
  }

  const agreement = await Agreement.findById(agreementId);

  if (!agreement) {
    throw new AppError("Agreement not found", 404);
  }

  if (agreement.status !== "pending") {
    throw new AppError("Only pending agreements can be edited", 400);
  }

  if (schedule !== undefined) {
    agreement.schedule = schedule;
  }

  if (startDate !== undefined) {
    agreement.startDate = startDate;
  }

  await agreement.save();

  // Populate the agreement before returning
  await agreement.populate([
    {
      path: "client",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
    {
      path: "worker",
      select: "firstName lastName email phoneNumber dateOfBirth address",
    },
    { path: "job", select: "title location supportDetails" },
  ]);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement updated successfully",
    data: agreement,
  });
});
