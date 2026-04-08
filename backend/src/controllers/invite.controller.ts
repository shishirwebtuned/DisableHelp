import { Notification } from "../models/notification.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

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

  const existing = await Notification.findOne({
    recipient: receiverId,
    job: jobId,
    type: "job",
  });

  if (existing) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Invite already sent for this job and user.",
    });
  }

  await Notification.create({
    recipient: receiverId,
    sender: senderId,
    type: "job",
    title: "Job Invitation",
    message: `You have been invited to apply for a job.`,
    job: jobId,
    actionUrl: `/worker/jobs?jobId=${jobId}`,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job Invite sent successfully.",
  });
});

export const checkInvitation = catchAsync(async (req, res) => {
  const { jobId, receiverId } = req.query;

  if (!jobId || !receiverId) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: "jobId and receiverId are required",
    });
  }

  const existing = await Notification.findOne({
    recipient: receiverId,
    job: jobId,
    type: "job",
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitation status fetched successfully.",
    data: { invited: !!existing },
  });
});
