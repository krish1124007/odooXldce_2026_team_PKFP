import { Document } from "mongoose";

export interface ICity extends Document {
  name: string;
  country: string;
  region: string;
  description: string;
  image: string;
  costIndex: number;
  popularity: number;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}
