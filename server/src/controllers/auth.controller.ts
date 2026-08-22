import type { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "First name, last name, email, and password are required."
        });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long."
        });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User with this email already exists."
        });
    }

    // Force role to USER for public registration
    const newUser = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        passwordHash: password,
        role: "USER"
    });

    const token = newUser.generateAccessToken();
    const safeUser = newUser.toSafeObject();

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: safeUser
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password."
        });
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password."
        });
    }

    const token = user.generateAccessToken();
    const safeUser = user.toSafeObject();

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        message: "Logged in successfully.",
        token,
        user: safeUser
    });
});

// GET /api/auth/me
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
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

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required."
        });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
    }

    return res.status(200).json({
        success: true,
        message: "If an account exists for this email, password reset instructions will be sent."
    });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Token and new password are required."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters long."
        });
    }

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid or expired password reset token."
        });
    }

    user.passwordHash = newPassword;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now log in with your new password."
    });
});
