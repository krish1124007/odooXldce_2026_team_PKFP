import { Admin } from "../../models/admin.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";

const createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some(field => field?.trim() === "")) {
        return returnResponse(res, 400, "All fields are required", null);
    }

    const existingAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
    });

    if (existingAdmin) {
        return returnResponse(res, 400, "Admin already exists", null);
    }

    const admin = await Admin.create({ username, email, password });

    const createdAdmin = await Admin.findById(admin._id).select("-password");

    if (!createdAdmin) {
        return returnResponse(res, 500, "Something went wrong while creating admin", null);
    }

    return returnResponse(res, 201, "Admin created successfully", createdAdmin);
});

const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return returnResponse(res, 400, "Email and password are required", null);
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        return returnResponse(res, 404, "Admin not found", null);
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return returnResponse(res, 401, "Invalid credentials", null);
    }

    const accessToken = admin.generateAccessToken();

    const loggedInAdmin = await Admin.findById(admin._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json({
            statusCode: 200,
            data: { admin: loggedInAdmin, accessToken },
            message: "Admin logged in successfully"
        });
});

export { createAdmin, loginAdmin };