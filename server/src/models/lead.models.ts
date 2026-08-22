import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
    name: string;
    company: string;
    email: string;
    phone: string;
    status: "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
    dealValue: number;
    assignedTo?: string;
    notes?: string[];
}

const LeadSchema = new Schema<ILead>({
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"], 
        default: "New" 
    },
    dealValue: { type: Number, required: true, default: 0 },
    assignedTo: { type: String },
    notes: [{ type: String }]
}, { timestamps: true });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
