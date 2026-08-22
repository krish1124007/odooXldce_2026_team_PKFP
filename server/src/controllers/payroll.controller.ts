import type { Request, Response } from "express";
import { Payroll } from "../models/payroll.models.js";
import { Employee } from "../models/employee.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

export const generatePayroll = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, month, year, allowances, deductions } = req.body;

    if (!employeeId || !month || !year) {
        return returnResponse(res, 400, "Employee ID, Month, and Year are required", null);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }

    const basicSalary = employee.salary;
    const totalAllowances = Number(allowances) || 0;
    const totalDeductions = Number(deductions) || 0;
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const payroll = await Payroll.create({
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        month,
        year,
        basicSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        netSalary,
        paymentStatus: "Pending"
    });

    return returnResponse(res, 201, "Payroll generated successfully", payroll);
});

export const getPayrolls = asyncHandler(async (req: Request, res: Response) => {
    const payrolls = await Payroll.find().sort({ createdAt: -1 });
    return returnResponse(res, 200, "Payrolls fetched successfully", payrolls);
});

export const markPayrollAsPaid = asyncHandler(async (req: Request, res: Response) => {
    const { payrollId } = req.params;
    const payroll = await Payroll.findByIdAndUpdate(
        payrollId,
        { paymentStatus: "Paid", paidDate: new Date() },
        { new: true }
    );

    if (!payroll) {
        return returnResponse(res, 404, "Payroll record not found", null);
    }

    return returnResponse(res, 200, "Payroll marked as Paid", payroll);
});
