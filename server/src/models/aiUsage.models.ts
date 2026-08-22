import mongoose, { Schema, Document } from "mongoose";

export interface IAIUsage extends Document {
  userId?: mongoose.Types.ObjectId;
  conversationId?: string;
  requestType: string;
  success: boolean;
  toolCalls: number;
  durationMs: number;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    conversationId: {
      type: String,
      default: "",
    },
    requestType: {
      type: String,
      default: "chat",
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    toolCalls: {
      type: Number,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    aiModel: {
      type: String,
      default: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast aggregation in analytics
AIUsageSchema.index({ createdAt: -1 });
AIUsageSchema.index({ userId: 1 });
AIUsageSchema.index({ success: 1 });

export const AIUsage = mongoose.model<IAIUsage>("AIUsage", AIUsageSchema);
