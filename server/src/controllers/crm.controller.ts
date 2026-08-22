import type { Request, Response } from "express";
import { Lead } from "../models/lead.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { returnResponse } from "../utils/apiResponse.js";

export const createLead = asyncHandler(async (req: Request, res: Response) => {
    const { name, company, email, phone, dealValue, assignedTo, notes } = req.body;

    if (!name || !company || !email || !phone) {
        return returnResponse(res, 400, "Name, Company, Email, and Phone are required", null);
    }

    const lead = await Lead.create({
        name,
        company,
        email,
        phone,
        dealValue: dealValue || 0,
        assignedTo,
        notes: notes ? [notes] : []
    });

    return returnResponse(res, 201, "Lead created successfully", lead);
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const filter: any = status ? { status: status as string } : {};
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    return returnResponse(res, 200, "Leads fetched successfully", leads);
});

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.params;
    const { status } = req.body;

    const validStatuses = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
    if (!validStatuses.includes(status)) {
        return returnResponse(res, 400, `Invalid status. Must be one of ${validStatuses.join(", ")}`, null);
    }

    const lead = await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
    if (!lead) {
        return returnResponse(res, 404, "Lead not found", null);
    }

    return returnResponse(res, 200, "Lead status updated successfully", lead);
});

export const addLeadNote = asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.params;
    const { note } = req.body;

    if (!note) {
        return returnResponse(res, 400, "Note text is required", null);
    }

    const lead = await Lead.findByIdAndUpdate(
        leadId,
        { $push: { notes: note } },
        { new: true }
    );

    if (!lead) {
        return returnResponse(res, 404, "Lead not found", null);
    }

    return returnResponse(res, 200, "Note added to lead", lead);
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
    const lead = await Lead.findByIdAndDelete(req.params.leadId);
    if (!lead) {
        return returnResponse(res, 404, "Lead not found", null);
    }
    return returnResponse(res, 200, "Lead deleted successfully", null);
});
