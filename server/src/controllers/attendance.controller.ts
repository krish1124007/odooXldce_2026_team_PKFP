import type { Request, Response } from "express";
import { Attendance } from "../models/attendance.models.js";
import { Leave } from "../models/leave.models.js";
import { Employee } from "../models/employee.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Clock In Endpoint
export const clockIn = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, status } = req.body;
    if (!employeeId) {
        return returnResponse(res, 400, "Employee ID is required", null);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
        employeeId,
        date: { $gte: today }
    });

    if (existing) {
        return returnResponse(res, 400, "Employee already clocked in today", existing);
    }

    const attendance = await Attendance.create({
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: new Date(),
        checkIn: new Date(),
        status: status || "Present"
    });

    return returnResponse(res, 201, "Clock in recorded successfully", attendance);
});

// Clock Out Endpoint
export const clockOut = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceId } = req.body;
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        return returnResponse(res, 404, "Attendance record not found", null);
    }

    attendance.checkOut = new Date();
    if (attendance.checkIn) {
        const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        attendance.workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    await attendance.save();
    return returnResponse(res, 200, "Clock out recorded successfully", attendance);
});

// Get Attendance Logs
export const getAttendanceLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await Attendance.find().sort({ date: -1 }).limit(100);
    return returnResponse(res, 200, "Attendance logs fetched", logs);
});

// Apply for Leave
export const applyLeave = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
        return returnResponse(res, 400, "All leave request fields are required", null);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }

    const leave = await Leave.create({
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
    });

    return returnResponse(res, 201, "Leave request submitted", leave);
});

// Update Leave Status (Approve / Reject)
export const updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
    const { leaveId } = req.params;
    const { status, reviewedBy } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
        return returnResponse(res, 400, "Invalid status. Must be Approved or Rejected", null);
    }

    const leave = await Leave.findByIdAndUpdate(
        leaveId,
        { status, reviewedBy: reviewedBy || "Admin" },
        { new: true }
    );

    if (!leave) {
        return returnResponse(res, 404, "Leave request not found", null);
    }

    return returnResponse(res, 200, `Leave request ${status.toLowerCase()} successfully`, leave);
});

// Get All Leaves
export const getLeaves = asyncHandler(async (req: Request, res: Response) => {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    return returnResponse(res, 200, "Leaves list fetched", leaves);
});
