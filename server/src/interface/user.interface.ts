import { Document } from "mongoose";

export interface ISavedDestination {
    destinationId?: string;
    name?: string;
    country?: string;
    savedAt?: Date;
}

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    profilePhoto?: string;
    language: string;
    travelStyle: string;
    interests: string[];
    travelPace: string;
    savedDestinations: ISavedDestination[];
    role: "USER" | "ADMIN";
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    
    generateAccessToken(): string;
    isPasswordCorrect(password: string): Promise<boolean>;
    toSafeObject(): Record<string, any>;
}

export type { IUser };

