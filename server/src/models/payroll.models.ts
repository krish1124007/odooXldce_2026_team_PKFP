import mongoose, { Document, Schema } from "mongoose";

export interface IPayroll extends Document {
    employeeId: mongoose.Types.ObjectId;
    employeeName: string;
    month: string; // e.g., "August"
    year: number;  // e.g., 2026
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    paymentStatus: "Paid" | "Pending";
    paidDate?: Date;
}

const PayrollSchema = new Schema<IPayroll>({
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
    paidDate: { type: Date }
}, { timestamps: true });

export const Payroll = mongoose.model<IPayroll>("Payroll", PayrollSchema);
