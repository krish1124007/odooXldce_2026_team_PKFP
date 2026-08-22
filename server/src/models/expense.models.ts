import mongoose, { Schema } from "mongoose";
import type { IExpense } from "../interface/expense.interface.js";

const ExpenseSchema = new Schema<IExpense>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Trip ID is required"],
    },
    stopId: {
      type: Schema.Types.ObjectId,
      ref: "TripStop",
      default: undefined,
    },
    itineraryActivityId: {
      type: Schema.Types.ObjectId,
      ref: "ItineraryActivity",
      default: undefined,
    },
    category: {
      type: String,
      enum: ["TRANSPORT", "STAY", "ACTIVITY", "MEAL", "OTHER"],
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Expense description is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than or equal to 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
    },
    type: {
      type: String,
      enum: ["ESTIMATED", "ACTUAL"],
      required: [true, "Expense type is required"],
      default: "ACTUAL",
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ tripId: 1 });
ExpenseSchema.index({ tripId: 1, date: 1 });
ExpenseSchema.index({ itineraryActivityId: 1 });
ExpenseSchema.index({ category: 1 });

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
