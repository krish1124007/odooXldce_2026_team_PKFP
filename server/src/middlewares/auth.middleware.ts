import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { returnResponse } from "../utils/apiResponse.js";

declare global {
    namespace Express {
        interface Request {
            user?: any;
            admin?: any;
        }
    }
}

export const verifyUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header("Authorization");
        let token = req.cookies?.accessToken;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "").trim();
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const secret = process.env.JWT_SECRET || "globetrotter_default_secret_key_2026";
        const decoded = jwt.verify(token, secret) as { userId?: string; _id?: string; role?: string };

        const userId = decoded.userId || decoded._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }

        const user = await User.findById(userId).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. User not found."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been disabled. Please contact support."
            });
        }

        req.user = user;
        next();
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Token expired or invalid."
        });
    }
});

// Reusable Role Authorization Middleware
export const requireRole = (role: "ADMIN" | "USER") => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires ${role} role.`
            });
        }

        next();
    };
};

export const verifyAdmin = requireRole("ADMIN");

