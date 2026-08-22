import mongoose, { Schema } from "mongoose";
import type { ICity } from "../interface/city.interface.js";

const CitySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    costIndex: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    popularity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

CitySchema.index({ name: 1 });
CitySchema.index({ country: 1 });
CitySchema.index({ region: 1 });
CitySchema.index({ costIndex: 1 });
CitySchema.index({ popularity: -1 });

export const City = mongoose.model<ICity>("City", CitySchema);
