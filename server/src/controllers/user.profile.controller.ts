import type { Request, Response } from "express";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/users/profile
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const safeUser = req.user.toSafeObject ? req.user.toSafeObject() : req.user;
    return res.status(200).json({
        success: true,
        user: safeUser
    });
});

// PUT /api/users/profile
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const { firstName, lastName, email, profilePhoto, language } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (language !== undefined) user.language = language;

    if (email && email.trim().toLowerCase() !== user.email) {
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const existing = await User.findOne({ email: trimmedEmail });
        if (existing && existing._id.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Email address is already in use by another account."
            });
        }
        user.email = trimmedEmail;
    }

    await user.save();

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: user.toSafeObject()
    });
});

// PUT /api/users/preferences
export const updateUserPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    const { travelStyle, interests, travelPace } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (travelStyle !== undefined) user.travelStyle = travelStyle;
    if (Array.isArray(interests)) user.interests = interests;
    if (travelPace !== undefined) user.travelPace = travelPace;

    await user.save();

    return res.status(200).json({
        success: true,
        message: "Travel preferences updated successfully.",
        user: user.toSafeObject()
    });
});

// DELETE /api/users/account
export const deleteUserAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("accessToken");

    return res.status(200).json({
        success: true,
        message: "Account deleted successfully."
    });
});
