import type { IAdmin } from "../interface/admin.interface.js";
import mongoose, { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

type AdminType = IAdmin & Document;


const AdminSchema = new mongoose.Schema<AdminType>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

AdminSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

AdminSchema.methods.generateAccessToken = function (): string {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, process.env.JWT_SECRET as string, {
        expiresIn: "1d"
    })
}

AdminSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

export const Admin = mongoose.model<AdminType>("Admin", AdminSchema)
