import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

// helper
const toObjectId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }
  return new mongoose.Types.ObjectId(id);
};

export const sendInvite = catchAsync(async (req, res) => {
  const { jobId, receiverId } = req.body;
  const senderId = req.user._id;

  if (!jobId || !receiverId) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "jobId and receiverId are required",
    });
  }

  // ✅ convert to ObjectId
  const jobObjectId = toObjectId(jobId);
  const receiverObjectId = toObjectId(receiverId);

  // ✅ typed query
  const existing = await Notification.findOne({
    recipient: receiverObjectId,
    job: jobObjectId,
    type: "job",
  } as any);

  if (existing) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Invite already sent for this job and user.",
    });
  }

  await Notification.create({
    recipient: receiverObjectId,
    sender: senderId,
    type: "job",
    title: "Job Invitation",
    message: "You have been invited to apply for a job.",
    job: jobObjectId,
    actionUrl: `/worker/jobs?jobId=${jobId}`,
  });

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job Invite sent successfully.",
  });
});

export const checkInvitation = catchAsync(async (req, res) => {
  const { jobId, receiverId } = req.query;

  // ✅ strict validation
  if (typeof jobId !== "string" || typeof receiverId !== "string") {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Invalid query params",
    });
  }

  const jobObjectId = toObjectId(jobId);
  const receiverObjectId = toObjectId(receiverId);

  const existing = await Notification.findOne({
    recipient: receiverObjectId,
    job: jobObjectId,
    type: "job",
  } as any);

  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitation status fetched successfully.",
    data: { invited: !!existing },
  });
});
