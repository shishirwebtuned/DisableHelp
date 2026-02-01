import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface JwtPayload {
  id: string;
  role: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed" });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
