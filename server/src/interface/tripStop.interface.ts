import { Document, Types } from "mongoose";

export interface ITripStop extends Document {
  tripId: Types.ObjectId;
  cityId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  order: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
