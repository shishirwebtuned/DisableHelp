import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/sendResponse.js";

export const approveUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { approved } = req.body;

  const user = await User.findById(userId);

  if (!user) throw new AppError("User not found", 400);

  if (approved !== undefined) user.approved = approved;

  await user.save();

  const { password, ...userResponse } = user.toObject();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User approval updated successfully",
    data: userResponse,
  });
});
