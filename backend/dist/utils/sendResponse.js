export const sendResponse = (res, { success, statusCode, message, data, error }) => {
    return res.status(statusCode).json({
        success,
        statusCode,
        message,
        ...(data && { data }),
        ...(error && { error }),
    });
};
//# sourceMappingURL=sendResponse.js.map