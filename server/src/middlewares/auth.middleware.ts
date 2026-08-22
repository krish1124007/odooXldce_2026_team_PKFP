import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.models.js";
import { User } from "../models/user.models.js";
import { returnResponse } from "../utils/apiResponse.js";

// Extend Express Request interface to include admin and user
declare global {
    namespace Express {
        interface Request {
            admin?: any;
            user?: any;
        }
    }
}

export const verifyAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return returnResponse(res, 401, "Unauthorized request", null);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const admin = await Admin.findById(decodedToken?._id).select("-password");

        if (!admin) {
            return returnResponse(res, 401, "Invalid Access Token", null);
        }

        req.admin = admin;
        next();
    } catch (error) {
        return returnResponse(res, 401, "Invalid Access Token", null);
    }
});

export const verifyUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return returnResponse(res, 401, "Unauthorized request", null);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            return returnResponse(res, 401, "Invalid Access Token", null);
        }

        req.user = user;
        next();
    } catch (error) {
        return returnResponse(res, 401, "Invalid Access Token", null);
    }
});
