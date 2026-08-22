import { Document, Schema } from "mongoose";

export type ExpenseCategory = "TRANSPORT" | "STAY" | "ACTIVITY" | "MEAL" | "OTHER";
export type ExpenseType = "ESTIMATED" | "ACTUAL";

export interface IExpense extends Document {
  tripId: Schema.Types.ObjectId;
  stopId?: Schema.Types.ObjectId;
  itineraryActivityId?: Schema.Types.ObjectId;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  type: ExpenseType;
  createdAt: Date;
  updatedAt: Date;
}
