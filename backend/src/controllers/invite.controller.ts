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
