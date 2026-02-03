import { sendResponse } from "../utils/sendResponse.js";
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    sendResponse(res, {
        success: false,
        statusCode,
        message,
        error: process.env.NODE_ENV === "development" ? err : undefined,
    });
};
//# sourceMappingURL=error.middleware.js.map