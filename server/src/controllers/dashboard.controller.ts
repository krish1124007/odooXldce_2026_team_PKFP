import type { Request, Response } from "express";
import { Employee } from "../models/employee.models.js";
import { Attendance } from "../models/attendance.models.js";
import { Leave } from "../models/leave.models.js";
import { Lead } from "../models/lead.models.js";
import { Payroll } from "../models/payroll.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    // 1. Employee metrics
    const totalEmployees = await Employee.countDocuments({ status: { $ne: "Terminated" } });

    // 2. Attendance metrics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const presentToday = await Attendance.countDocuments({
        date: { $gte: today },
        status: { $in: ["Present", "Late"] }
    });

    const onLeaveToday = await Leave.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        status: "Approved"
    });

    const pendingLeaveRequests = await Leave.countDocuments({ status: "Pending" });

    // 3. CRM Lead Pipeline metrics
    const totalLeads = await Lead.countDocuments();
    const leadsPipeline = await Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$dealValue" } } }
    ]);

    // 4. Payroll Summary
    const totalPayrollSpent = await Payroll.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$netSalary" } } }
    ]);

    // 5. Recent Birthdays
    const upcomingBirthdays = await Employee.find({ birthdayDate: { $exists: true } })
        .select("firstName lastName birthdayDate department")
        .limit(10);

    return returnResponse(res, 200, "Dashboard metrics fetched successfully", {
        kpi: {
            totalEmployees,
            presentToday,
            onLeaveToday,
            pendingRequests: pendingLeaveRequests
        },
        crm: {
            totalLeads,
            pipeline: leadsPipeline
        },
        financials: {
            totalPayrollSpent: totalPayrollSpent[0]?.total || 0
        },
        birthdays: upcomingBirthdays
    });
});
