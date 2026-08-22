import mongoose, { Schema } from "mongoose";
import type { IItineraryActivity } from "../interface/itineraryActivity.interface.js";

const ItineraryActivitySchema = new Schema<IItineraryActivity>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Trip ID is required"],
    },
    stopId: {
      type: Schema.Types.ObjectId,
      ref: "TripStop",
      required: [true, "Stop ID is required"],
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: [true, "Activity ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
      validate: {
        validator: function (this: any, value: string) {
          if (!this.startTime || !value) return true;
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order must be a non-negative number"],
    },
    notes: {
      type: String,
      default: "",
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, "Estimated cost must be non-negative"],
    },
  },
  { timestamps: true }
);

ItineraryActivitySchema.index({ tripId: 1 });
ItineraryActivitySchema.index({ stopId: 1 });
ItineraryActivitySchema.index({ activityId: 1 });
ItineraryActivitySchema.index({ date: 1 });
ItineraryActivitySchema.index({ stopId: 1, date: 1, order: 1 });

export const ItineraryActivity = mongoose.model<IItineraryActivity>(
  "ItineraryActivity",
  ItineraryActivitySchema
);
