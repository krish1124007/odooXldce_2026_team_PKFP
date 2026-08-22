import type { IUser } from "../interface/user.interface.js";
import mongoose, { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

type UserType = IUser & Document;

const UserSchema = new mongoose.Schema<UserType>({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email address is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    passwordHash: {
        type: String,
        required: [true, "Password is required"]
    },
    profilePhoto: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: "English"
    },
    travelStyle: {
        type: String,
        default: "Balanced"
    },
    interests: {
        type: [String],
        default: []
    },
    travelPace: {
        type: String,
        default: "Balanced"
    },
    savedDestinations: {
        type: [
            {
                destinationId: { type: String },
                name: { type: String },
                country: { type: String },
                savedAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    }
}, { 
    timestamps: true 
});

// Hash password before saving if modified
UserSchema.pre("save", async function () {
    if (this.isModified("passwordHash")) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
});

// Generate JWT token
UserSchema.methods.generateAccessToken = function (): string {
    const secret = process.env.JWT_SECRET || "globetrotter_default_secret_key_2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign(
        {
            userId: this._id.toString(),
            role: this.role
        },
        secret,
        { expiresIn: expiresIn as any }
    );
};

// Compare provided password with passwordHash
UserSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
};

// Helper for safe serialization
UserSchema.methods.toSafeObject = function (): Record<string, any> {
    const obj: Record<string, any> = this.toObject ? this.toObject() : { ...this };
    delete obj.passwordHash;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.__v;
    obj.id = obj._id ? obj._id.toString() : undefined;
    return obj;
};

// Strip sensitive fields on JSON transform
UserSchema.set("toJSON", {
    transform: function (doc, ret: Record<string, any>) {
        delete ret.passwordHash;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        ret.id = ret._id;
        return ret;
    }
});


export const User = mongoose.model<UserType>("User", UserSchema);

