// import { AppError } from "../utils/AppError.js";
// import { catchAsync } from "../utils/catchAsync.js";

// export const createSession = catchAsync(async (req, res) => {
//     const { agreementId, startDate, endDate } = req.body;

//     if (!agreementId || !startDate || !endDate) {
//       throw new AppError("Agreement ID, start date, and end date are required", 400);
//     }

//     // Validate agreement existence and status
//     const agreement = await Agreement.findById(agreementId);
//     if (!agreement) {
//       throw new AppError("Agreement not found", 404);
//     }

//     if (agreement.status !== "active") {
//       throw new AppError("Agreement is not active", 400);
//     }

// })
