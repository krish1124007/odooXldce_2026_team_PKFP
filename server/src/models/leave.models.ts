import mongoose, { Document, Schema } from "mongoose";

export interface ILeave extends Document {
    employeeId: mongoose.Types.ObjectId;
    employeeName: string;
    leaveType: "Sick Leave" | "Casual Leave" | "Annual Leave" | "Unpaid Leave";
    startDate: Date;
    endDate: Date;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: string;
}

const LeaveSchema = new Schema<ILeave>({
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, required: true },
    leaveType: { 
        type: String, 
        enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Unpaid Leave"], 
        required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewedBy: { type: String }
}, { timestamps: true });

export const Leave = mongoose.model<ILeave>("Leave", LeaveSchema);
