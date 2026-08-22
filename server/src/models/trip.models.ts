import mongoose, { Schema } from "mongoose";
import type { ITrip } from "../interface/trip.interface.js";

const TripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["DRAFT", "UPCOMING", "ONGOING", "COMPLETED"],
      default: "UPCOMING",
    },
    visibility: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PRIVATE",
    },
    publicId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    budget: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    destinations: [
      {
        type: Schema.Types.ObjectId,
        ref: "City",
      },
    ],
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
  },
  { timestamps: true }
);

TripSchema.index({ userId: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ startDate: 1 });
TripSchema.index({ visibility: 1 });
TripSchema.index({ publicId: 1 });

export const Trip = mongoose.model<ITrip>("Trip", TripSchema);
