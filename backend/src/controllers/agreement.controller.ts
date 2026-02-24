import { Agreement } from "../models/agreement.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

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

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Agreement accepted successfully",
    data: agreement,
  });
});
