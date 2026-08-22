import mongoose, { Schema } from "mongoose";
import type { ITripStop } from "../interface/tripStop.interface.js";

const TripStopSchema = new Schema<ITripStop>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Trip ID is required"],
    },
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City ID is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (this: any, value: Date) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be greater than or equal to start date",
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
  },
  { timestamps: true }
);

TripStopSchema.index({ tripId: 1 });
TripStopSchema.index({ cityId: 1 });
TripStopSchema.index({ tripId: 1, order: 1 });

export const TripStop = mongoose.model<ITripStop>("TripStop", TripStopSchema);
