import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
    employeeId: mongoose.Types.ObjectId;
    employeeName: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: "Present" | "Late" | "Absent" | "Half Day";
    workHours?: number;
}

const AttendanceSchema = new Schema<IAttendance>({
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ["Present", "Late", "Absent", "Half Day"], default: "Present" },
    workHours: { type: Number, default: 0 }
}, { timestamps: true });

export const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);
