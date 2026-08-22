import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    joiningDate: Date;
    salary: number;
    status: "Active" | "On Leave" | "Terminated";
    birthdayDate?: string; // e.g. "Sep 15"
}

const EmployeeSchema = new Schema<IEmployee>({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, required: true },
    status: { type: String, enum: ["Active", "On Leave", "Terminated"], default: "Active" },
    birthdayDate: { type: String }
}, { timestamps: true });

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
