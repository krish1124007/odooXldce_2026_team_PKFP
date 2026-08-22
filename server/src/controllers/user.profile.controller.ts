import type { Request, Response } from "express";
import { User } from "../models/user.models.js";
import { City } from "../models/city.models.js";
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

    const { firstName, lastName, email, profilePhoto, language, travelStyle, travelPace, interests } = req.body;

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
    if (travelStyle !== undefined) user.travelStyle = travelStyle;
    if (travelPace !== undefined) user.travelPace = travelPace;
    if (Array.isArray(interests)) user.interests = interests;

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

// GET /api/users/saved-destinations
export const getSavedDestinations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Extract saved destination IDs
    const cityIds = user.savedDestinations.map((sd: any) => sd.destinationId || sd._id || sd).filter(Boolean);
    const cities = await City.find({ _id: { $in: cityIds } });

    return res.status(200).json({
        success: true,
        data: cities
    });
});

// POST /api/users/saved-destinations/:cityId
export const saveDestination = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { cityId } = req.params;

    const city = await City.findById(cityId);
    if (!city) {
        return res.status(404).json({ success: false, message: "City not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const alreadySaved = user.savedDestinations.some(
        (item: any) => (item.destinationId === cityId || item._id?.toString() === cityId || item.toString() === cityId)
    );

    if (!alreadySaved) {
        user.savedDestinations.push({
            destinationId: city._id.toString(),
            name: city.name,
            country: city.country,
            savedAt: new Date()
        } as any);
        await user.save();
    }

    const cityIds = user.savedDestinations.map((sd: any) => sd.destinationId || sd._id || sd).filter(Boolean);
    const cities = await City.find({ _id: { $in: cityIds } });

    return res.status(200).json({
        success: true,
        data: cities
    });
});

// DELETE /api/users/saved-destinations/:cityId
export const removeSavedDestination = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { cityId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    user.savedDestinations = user.savedDestinations.filter(
        (item: any) => item.destinationId !== cityId && item._id?.toString() !== cityId && item.toString() !== cityId
    );

    await user.save();

    const cityIds = user.savedDestinations.map((sd: any) => sd.destinationId || sd._id || sd).filter(Boolean);
    const cities = await City.find({ _id: { $in: cityIds } });

    return res.status(200).json({
        success: true,
        data: cities
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
