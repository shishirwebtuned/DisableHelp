import multer from "multer";
import e from "express";
export declare const upload: multer.Multer;
export declare const registerUser: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const verifyEmail: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const loginUser: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const forgotPassword: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const verifyOtp: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const resetPassword: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const changePassword: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const getAllUsers: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
export declare const getMe: (req: e.Request, res: e.Response, next: e.NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map