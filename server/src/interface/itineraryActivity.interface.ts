import { Document, Types } from "mongoose";

export interface IItineraryActivity extends Document {
  tripId: Types.ObjectId;
  stopId: Types.ObjectId;
  activityId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  order: number;
  notes?: string;
  estimatedCost: number;
  createdAt?: Date;
  updatedAt?: Date;
}
