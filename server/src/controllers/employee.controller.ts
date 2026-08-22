import type { Request, Response } from "express";
import { Employee } from "../models/employee.models.js";
import { Department } from "../models/department.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

// Employee Controllers
export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, department, designation, salary, birthdayDate } = req.body;

    if (!firstName || !lastName || !email || !phone || !department || !designation || !salary) {
        return returnResponse(res, 400, "All required fields must be provided", null);
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
        return returnResponse(res, 400, "Employee with this email already exists", null);
    }

    const employee = await Employee.create({
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        salary,
        birthdayDate
    });

    return returnResponse(res, 201, "Employee created successfully", employee);
});

export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return returnResponse(res, 200, "Employees fetched successfully", employees);
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }
    return returnResponse(res, 200, "Employee details fetched", employee);
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }
    return returnResponse(res, 200, "Employee updated successfully", employee);
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
        return returnResponse(res, 404, "Employee not found", null);
    }
    return returnResponse(res, 200, "Employee deleted successfully", null);
});

// Department Controllers
export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { name, code, description, headOfDepartment } = req.body;
    if (!name || !code) {
        return returnResponse(res, 400, "Name and Department Code are required", null);
    }

    const dept = await Department.create({ name, code, description, headOfDepartment });
    return returnResponse(res, 201, "Department created successfully", dept);
});

export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await Department.find().sort({ name: 1 });
    return returnResponse(res, 200, "Departments fetched successfully", departments);
});
