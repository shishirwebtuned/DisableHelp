import type { Request, Response, NextFunction } from "express";
type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const catchAsync: (fn: AsyncController) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=catchAsync.d.ts.map