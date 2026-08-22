import { Document, Schema } from "mongoose";

export interface ITripBudget {
  amount: number;
  currency: string;
}

export interface ITrip extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  description: string;
  coverPhoto: string;
  startDate: Date;
  endDate: Date;
  status: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED";
  visibility: "PRIVATE" | "PUBLIC";
  budget: ITripBudget;
  destinations: Schema.Types.ObjectId[];
  activities: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
