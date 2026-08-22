import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { processAgentChat } from "../agents/orchestrator.js";
import { getPendingAction, removePendingAction } from "../agents/actionStore.js";
import { executeTool } from "../agents/toolRegistry.js";

// @desc    Process Agentic AI Chat Request
// @route   POST /api/agent/chat
// @access  Private (Authenticated)
export const processAgentChatHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString() || req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for GlobeTrotter AI Agent.",
    });
  }

  const { message, tripId, cityId, conversationId, context } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message string is required.",
    });
  }

  const agentContext = {
    page: context?.page || "dashboard",
    tripId: tripId || context?.tripId,
    cityId: cityId || context?.cityId,
    conversationId,
  };

  const result = await processAgentChat({
    userId,
    message: message.trim(),
    context: agentContext,
  });

  return res.status(200).json(result);
});

// @desc    Confirm and Execute a Proposed Write Action
// @route   POST /api/agent/actions/confirm
// @access  Private (Authenticated)
export const confirmActionHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString() || req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const { actionId, approved } = req.body;

  if (!actionId) {
    return res.status(400).json({
      success: false,
      message: "actionId is required.",
    });
  }

  const pendingAction = getPendingAction(actionId, userId);

  if (!pendingAction) {
    return res.status(404).json({
      success: false,
      message: "Action proposal not found, expired, or access denied.",
    });
  }

  if (!approved) {
    removePendingAction(actionId);
    return res.status(200).json({
      success: true,
      message: "Action proposal cancelled by user.",
    });
  }

  // User Approved! Execute the actual WRITE tool
  const executionResult = await executeTool(pendingAction.toolName, pendingAction.args, userId);
  removePendingAction(actionId);

  if (!executionResult.success) {
    return res.status(400).json({
      success: false,
      message: executionResult.error || "Failed to execute approved action.",
    });
  }

  return res.status(200).json({
    success: true,
    message: executionResult.message || "Approved action executed successfully!",
    data: executionResult.data,
  });
});
