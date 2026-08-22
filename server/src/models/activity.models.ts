import mongoose, { Schema } from "mongoose";
import type { IActivity } from "../interface/activity.interface.js";

const ActivitySchema = new Schema<IActivity>(
  {
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City ID is required"],
    },
    name: {
      type: String,
      required: [true, "Activity name is required"],
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
    type: {
      type: String,
      required: [true, "Activity type is required"],
      enum: [
        "Sightseeing",
        "Food",
        "Adventure",
        "Culture",
        "Nature",
        "Shopping",
        "Nightlife",
        "Photography",
      ],
    },
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: 60,
    },
    popularity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ cityId: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ cost: 1 });
ActivitySchema.index({ durationMinutes: 1 });
ActivitySchema.index({ name: 1 });

export const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);
