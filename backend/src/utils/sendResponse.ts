import type { Response } from "express";

interface IResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
}

export const sendResponse = <T>(
  res: Response,
  { success, statusCode, message, data, error }: IResponse<T>,
) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    ...(data && { data }),
    ...(error && { error }),
  });
};
