import { User } from "../../models/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";
import type { Request, Response } from "express";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if ([username, email, password].some(field => field?.trim() === "")) {
        return returnResponse(res, 400, "All fields are required", null);
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        return returnResponse(res, 400, "User with this email or username already exists", null);
    }

    const user = await User.create({ username, email, password });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        return returnResponse(res, 500, "Something went wrong while registering user", null);
    }

    return returnResponse(res, 201, "User registered successfully", createdUser);
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return returnResponse(res, 400, "Email and password are required", null);
    }

    const user = await User.findOne({ email });

    if (!user) {
        return returnResponse(res, 404, "User not found", null);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return returnResponse(res, 401, "Invalid credentials", null);
    }

    const accessToken = user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json({
            statusCode: 200,
            data: { user: loggedInUser, accessToken },
            message: "User logged in successfully"
        });
});

export { registerUser, loginUser };
