import type { Response } from "express";
interface IResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    error?: any;
}
export declare const sendResponse: <T>(res: Response, { success, statusCode, message, data, error }: IResponse<T>) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=sendResponse.d.ts.map