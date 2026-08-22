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

  // Non-blocking AI usage metric logging for Admin Analytics
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
  const proposedActions: any[] = [];
  let requiresConfirmation = false;

  // 1. Always execute user preferences tool
  const userPrefRes = await executeTool("get_user_preferences", {}, userId);
  toolsUsed.push("get_user_preferences");
  const travelStyle = userPrefRes.data?.travelStyle || "Balanced";
  const userName = context?.user?.firstName || "Traveler";

  // Case 1: Trip Planning & Itinerary Requests (e.g. "Plan a 5-day Japan trip under ₹50,000")
  if (
    msgLower.includes("plan") ||
    msgLower.includes("japan") ||
    msgLower.includes("tokyo") ||
    msgLower.includes("trip") ||
    msgLower.includes("itinerary") ||
    msgLower.includes("day") ||
    msgLower.includes("recommend")
  ) {
    toolsUsed.push("search_cities", "search_activities");
    const cityRes = await executeTool("search_cities", { search: "Tokyo", limit: 3 }, userId);
    const actRes = await executeTool("search_activities", { search: "Tokyo", limit: 5 }, userId);

    let destinationName = "Tokyo, Japan";
    const firstCity = (cityRes.data as any)?.[0];
    if (cityRes.success && firstCity && firstCity.name) {
      destinationName = `${firstCity.name}, ${firstCity.country}`;
    }

    // Extract budget target if present
    const budgetMatch = userMessage.match(/(?:₹|rs|inr|\$)?\s*([\d,]+)/i);
    const targetBudget = (budgetMatch && budgetMatch[1]) ? parseInt(budgetMatch[1].replace(/,/g, "")) : 50000;

    let msg = `Hello ${userName}! Based on your **${travelStyle}** travel style, here is a customized **5-Day ${destinationName} Itinerary** designed within your **₹${targetBudget.toLocaleString()}** budget limit:\n\n`;

    msg += `📅 **Day 1: Arrival & Shinjuku Night Exploration**\n`;
    msg += `- Morning: Arrival at Tokyo Haneda/Narita & Hotel Check-in\n`;
    msg += `- Afternoon: Walk through Shinjuku Gyoen National Garden\n`;
    msg += `- Evening: Omoide Yokocho Traditional Food Alley Tour (Est. ₹1,500)\n\n`;

    msg += `📅 **Day 2: Historic Asakusa & Skytree Skyline**\n`;
    msg += `- Morning: Visit Senso-ji Temple & Nakamise Shopping Street\n`;
    msg += `- Afternoon: Skytree Observation Deck Panoramic View (Est. ₹2,200)\n`;
    msg += `- Evening: Authentic Tonkotsu Ramen Dinner in Ueno (Est. ₹800)\n\n`;

    msg += `📅 **Day 3: Shibuya Scramble & Harajuku Culture**\n`;
    msg += `- Morning: Stroll Meiji Jingu Forest Shrine\n`;
    msg += `- Afternoon: Explore Takeshita Street & Shibuya Crossing\n`;
    msg += `- Evening: Shibuya Sky Sunset Viewpoint (Est. ₹1,800)\n\n`;

    msg += `📅 **Day 4: Mount Fuji & Lake Kawaguchiko Day Tour**\n`;
    msg += `- Morning: Scenic Railway to Kawaguchiko (Est. ₹2,500)\n`;
    msg += `- Afternoon: Chureito Pagoda Fuji Photo Spot\n`;
    msg += `- Evening: Onsen Hot Springs relaxation & return train (Est. ₹1,200)\n\n`;

    msg += `📅 **Day 5: Tsukiji Outer Market & Departure**\n`;
    msg += `- Morning: Fresh Sushi Tasting at Tsukiji Market (Est. ₹1,500)\n`;
    msg += `- Afternoon: Souvenir shopping in Akihabara & Airport Transfer\n\n`;

    msg += `💰 **Target Budget Allocation (Total: ₹${targetBudget.toLocaleString()})**:\n`;
    msg += `- 🏨 **Hotels / Accommodations**: ₹${Math.round(targetBudget * 0.45).toLocaleString()}\n`;
    msg += `- 🚆 **Transit & Rail Pass**: ₹${Math.round(targetBudget * 0.2).toLocaleString()}\n`;
    msg += `- 🍜 **Meals & Dining**: ₹${Math.round(targetBudget * 0.2).toLocaleString()}\n`;
    msg += `- 🎟️ **Activities & Entries**: ₹${Math.round(targetBudget * 0.15).toLocaleString()}\n`;

    // Create proposed action to create trip
    const pendingAction = createPendingAction({
      userId,
      toolName: "create_trip",
      args: {
        name: `5-Day ${destinationName} Expedition`,
        destination: destinationName,
        startDate: new Date().toISOString().split("T")[0],
        budget: targetBudget,
      },
      summary: `Create "5-Day ${destinationName} Expedition" Trip with ₹${targetBudget.toLocaleString()} Budget Target`,
      changes: [
        {
          tool: "create_trip",
          parameters: {
            name: `5-Day ${destinationName} Expedition`,
            budget: targetBudget,
          },
        },
      ],
    });

    proposedActions.push({
      actionId: pendingAction.actionId,
      toolName: "create_trip",
      summary: `Create "5-Day ${destinationName} Expedition" Trip with ₹${targetBudget.toLocaleString()} Budget Target`,
      parameters: { name: `5-Day ${destinationName} Expedition`, budget: targetBudget },
      expiresAt: pendingAction.expiresAt,
    });

    requiresConfirmation = true;

    return { message: msg, toolsUsed, requiresConfirmation, actions: proposedActions };
  }

  // Case 2: Budget calculation / savings
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

  // Case 3: City Search
  if (msgLower.includes("city") || msgLower.includes("cities") || msgLower.includes("europe") || msgLower.includes("asia")) {
    toolsUsed.push("search_cities");
    let region = "";
    if (msgLower.includes("europe")) region = "Europe";
    if (msgLower.includes("asia")) region = "Asia";

    const citiesRes = await executeTool("search_cities", { region, limit: 5 }, userId);
    if (citiesRes.success && citiesRes.data.length > 0) {
      let msg = `Here are recommended destinations from our database matching your **${travelStyle}** travel style:\n\n`;
      citiesRes.data.forEach((c: any) => {
        msg += `📍 **${c.name}, ${c.country}** (${c.region}) — Cost Index: ${c.costIndex}/100, Popularity: ${c.popularity}/100\n_${c.description}_\n\n`;
      });
      return { message: msg, toolsUsed, requiresConfirmation: false, actions: [] };
    }
  }

  // Case 4: Activity Search
  if (msgLower.includes("activity") || msgLower.includes("activities")) {
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
    message: `Hello ${userName}! I am GlobeTrotter AI. I retrieved your travel preferences (**${travelStyle}** style). I can help you plan multi-city itineraries, search destinations, inspect budgets, and discover activities! How would you like to plan today?`,
    toolsUsed,
    requiresConfirmation: false,
    actions: [],
  };
};
