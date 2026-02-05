import multer from "multer";
export declare const upload: multer.Multer;
export declare const registerUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const resendVerificationEmail: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const verifyEmail: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const loginUser: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const forgotPassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const verifyOtp: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const resetPassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const getAllUsers: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
export declare const getMe: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map