import { runGroqChat } from "../services/groqService.js";
import type { GroqChatMessage } from "../services/groqService.js";
import { GLOBETROTTER_AGENT_SYSTEM_PROMPT } from "./systemPrompt.js";
import { buildAgentContext } from "./contextBuilder.js";
import type { AgentContext } from "./contextBuilder.js";
import { getGroqToolsDefinitions, executeTool, isWriteTool } from "./toolRegistry.js";
import { createPendingAction } from "./actionStore.js";
import { formatAgentResponse } from "./responseFormatter.js";
import { AIUsage } from "../models/aiUsage.models.js";

const MAX_TOOL_ITERATIONS = 8;

export const processAgentChat = async (params: {
  userId: string;
  message: string;
  context?: AgentContext;
}) => {
  const startTime = Date.now();
  const { userId, message, context } = params;
  let isSuccess = true;

  const agentContext = await buildAgentContext(userId, context);
  const tools = getGroqToolsDefinitions();

  const conversationHistory: GroqChatMessage[] = [
    {
      role: "system",
      content: `${GLOBETROTTER_AGENT_SYSTEM_PROMPT}\n\nCURRENT USER & APPLICATION CONTEXT:\n${JSON.stringify(
        agentContext,
        null,
        2
      )}`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  const toolsUsed: string[] = [];
  const proposedActions: any[] = [];
  let requiresConfirmation = false;
  let iterations = 0;
  let finalMessage = "";

  try {
    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const assistantMessage = await runGroqChat({
        messages: conversationHistory,
        tools,
        temperature: 0.2,
      });

      if (!assistantMessage) {
        finalMessage = "I couldn't process your travel request at this time. Please try asking again.";
        break;
      }

      conversationHistory.push(assistantMessage as GroqChatMessage);

      // Check if LLM wants to call tool(s)
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function?.name;
          let toolArgs = {};
          try {
            toolArgs = JSON.parse(toolCall.function?.arguments || "{}");
          } catch (e) {
            toolArgs = {};
          }

          if (toolName && !toolsUsed.includes(toolName)) {
            toolsUsed.push(toolName);
          }

          // Check if tool is WRITE or READ
          if (isWriteTool(toolName)) {
            requiresConfirmation = true;

            const actionSummary = `Action proposal: ${toolName.replace(/_/g, " ")}`;
            const pendingAction = createPendingAction({
              userId,
              toolName,
              args: toolArgs,
              summary: actionSummary,
              changes: [
                {
                  tool: toolName,
                  parameters: toolArgs,
                },
              ],
            });

            proposedActions.push({
              actionId: pendingAction.actionId,
              toolName,
              summary: actionSummary,
              parameters: toolArgs,
              expiresAt: pendingAction.expiresAt,
            });

            // Feed tool result simulation to LLM so it continues narrative
            conversationHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolName,
              content: JSON.stringify({
                status: "PROPOSED",
                message: "Write operation formatted as a proposal awaiting user confirmation.",
                actionId: pendingAction.actionId,
              }),
            });
          } else {
            // READ Tool: Execute automatically!
            const result = await executeTool(toolName, toolArgs, userId);
            conversationHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolName,
              content: JSON.stringify(result),
            });
          }
        }
      } else {
        // Final assistant response generated
        finalMessage = assistantMessage.content || "";
        break;
      }
    }

    if (iterations >= MAX_TOOL_ITERATIONS && !finalMessage) {
      finalMessage = "I reached the tool execution limit while analyzing your request. Here are the recommendations found so far.";
    }
  } catch (error: any) {
    console.warn("Groq Agent offline/fallback mode active:", error.message);
    isSuccess = false;

    // Fallback offline handler using database tools directly
    const offlineResult = await handleOfflineAgentQuery(message, userId, agentContext);
    finalMessage = offlineResult.message;
    if (offlineResult.toolsUsed) {
      toolsUsed.push(...offlineResult.toolsUsed);
    }
    if (offlineResult.actions) {
      proposedActions.push(...offlineResult.actions);
      requiresConfirmation = offlineResult.requiresConfirmation;
    }
  }

  // Non-blocking AI usage metric logging for Phase 7 Admin Analytics
  const durationMs = Date.now() - startTime;
  AIUsage.create({
    userId,
    conversationId: context?.conversationId || "",
    requestType: proposedActions.length > 0 ? "proposal" : "chat",
    success: isSuccess,
    toolCalls: toolsUsed.length,
    durationMs,
    aiModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  }).catch((err) => console.warn("Failed to log AI usage metric:", err.message));

  return formatAgentResponse({
    message: finalMessage,
    requiresConfirmation: proposedActions.length > 0 || requiresConfirmation,
    actions: proposedActions,
    toolsUsed,
  });
};

// Graceful Offline Fallback Handler
const handleOfflineAgentQuery = async (userMessage: string, userId: string, context: any) => {
  const msgLower = userMessage.toLowerCase();
  const toolsUsed: string[] = [];

  // Case 1: Budget calculation / savings
  if (msgLower.includes("budget") || msgLower.includes("cost") || msgLower.includes("saving") || msgLower.includes("cheaper")) {
    if (context.activeTrip?.id) {
      toolsUsed.push("calculate_trip_budget", "find_budget_savings");
      const budgetRes = await executeTool("calculate_trip_budget", { tripId: context.activeTrip.id }, userId);
      const savingsRes = await executeTool("find_budget_savings", { tripId: context.activeTrip.id }, userId);

      let msg = `Here is your current budget analysis for **${context.activeTrip.name}**:\n\n`;
      if (budgetRes.success) {
        msg += `- **Planned Budget**: ₹${budgetRes.data.plannedBudget?.toLocaleString()}\n`;
        msg += `- **Total Estimated Cost**: ₹${budgetRes.data.totalEstimatedCost?.toLocaleString()}\n`;
        msg += `- **Remaining Budget**: ₹${budgetRes.data.remainingBudget?.toLocaleString()}\n\n`;
      }

      if (savingsRes.success && savingsRes.data.recommendations?.length > 0) {
        msg += `💡 **Potential Savings Found**: Up to ₹${savingsRes.data.totalPotentialSavings?.toLocaleString()}\n`;
        savingsRes.data.recommendations.forEach((rec: any, idx: number) => {
          msg += `${idx + 1}. Replace **${rec.currentActivity.name}** (₹${rec.currentActivity.cost}) with **${rec.alternativeActivity.name}** (₹${rec.alternativeActivity.cost}) → Save ₹${rec.potentialSaving}\n`;
        });
      }
      return { message: msg, toolsUsed, requiresConfirmation: false, actions: [] };
    }
  }

  // Case 2: City Search
  if (msgLower.includes("city") || msgLower.includes("cities") || msgLower.includes("europe") || msgLower.includes("asia")) {
    toolsUsed.push("search_cities");
    let region = "";
    if (msgLower.includes("europe")) region = "Europe";
    if (msgLower.includes("asia")) region = "Asia";

    const citiesRes = await executeTool("search_cities", { region, limit: 5 }, userId);
    if (citiesRes.success && citiesRes.data.length > 0) {
      let msg = `Here are recommended destinations from our database:\n\n`;
      citiesRes.data.forEach((c: any) => {
        msg += `📍 **${c.name}, ${c.country}** (${c.region}) — Cost Index: ${c.costIndex}/100, Popularity: ${c.popularity}/100\n_${c.description}_\n\n`;
      });
      return { message: msg, toolsUsed, requiresConfirmation: false, actions: [] };
    }
  }

  // Case 3: Activity Search
  if (msgLower.includes("activity") || msgLower.includes("activities") || msgLower.includes("tokyo") || msgLower.includes("paris")) {
    toolsUsed.push("search_activities");
    const actRes = await executeTool("search_activities", { search: userMessage.replace(/find|search|activities|activity/gi, "").trim(), limit: 5 }, userId);

    if (actRes.success && actRes.data.length > 0) {
      let msg = `Found ${actRes.data.length} activities matching your request:\n\n`;
      actRes.data.forEach((a: any) => {
        msg += `🌟 **${a.name}** (${a.cityName}) — ₹${a.cost === 0 ? "Free" : a.cost} (${a.durationMinutes} mins)\n_${a.description}_\n\n`;
      });
      return { message: msg, toolsUsed, requiresConfirmation: false, actions: [] };
    }
  }

  // Generic fallback response
  return {
    message: `Hello ${context.user.firstName}! I am GlobeTrotter AI. I can help you search real cities, discover activities, inspect trip itineraries, and optimize your travel budget. How would you like to plan today?`,
    toolsUsed: ["get_user_preferences"],
    requiresConfirmation: false,
    actions: [],
  };
};
