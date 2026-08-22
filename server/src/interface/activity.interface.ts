import { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  cityId: Schema.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  type: "Sightseeing" | "Food" | "Adventure" | "Culture" | "Nature" | "Shopping" | "Nightlife" | "Photography";
  cost: number;
  currency: string;
  durationMinutes: number;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}
