import { getUserPreferencesTool } from "../tools/userTools.js";
import { getTripTool, createTripTool, updateTripTool } from "../tools/tripTools.js";
import { searchCitiesTool, getCityDetailsTool, recommendCitiesTool } from "../tools/cityTools.js";
import { searchActivitiesTool, getActivityDetailsTool, recommendActivitiesTool } from "../tools/activityTools.js";
import {
  getItineraryTool,
  detectScheduleConflictsTool,
  getTripStopsTool,
  getStopActivitiesTool,
  addStopTool,
  updateStopTool,
  removeStopTool,
  reorderStopsTool,
  addActivityToItineraryTool,
  updateItineraryActivityTool,
  removeItineraryActivityTool,
  reorderItineraryActivitiesTool,
} from "../tools/itineraryTools.js";
import {
  calculateTripBudgetTool,
  getDailyBudgetTool,
  getBudgetBreakdownTool,
  findBudgetSavingsTool,
} from "../tools/budgetTools.js";

export interface ToolModule {
  definition: {
    type: string;
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  };
  handler: (args: any, userId: string) => Promise<any>;
  isWrite?: boolean;
}

export const toolRegistry: Record<string, ToolModule> = {
  get_user_preferences: getUserPreferencesTool,
  get_trip: getTripTool,
  create_trip: createTripTool,
  update_trip: updateTripTool,
  search_cities: searchCitiesTool,
  get_city_details: getCityDetailsTool,
  recommend_cities: recommendCitiesTool,
  search_activities: searchActivitiesTool,
  get_activity_details: getActivityDetailsTool,
  recommend_activities: recommendActivitiesTool,
  get_itinerary: getItineraryTool,
  detect_schedule_conflicts: detectScheduleConflictsTool,
  get_trip_stops: getTripStopsTool,
  get_stop_activities: getStopActivitiesTool,
  add_stop: addStopTool,
  update_stop: updateStopTool,
  remove_stop: removeStopTool,
  reorder_stops: reorderStopsTool,
  add_activity_to_itinerary: addActivityToItineraryTool,
  update_itinerary_activity: updateItineraryActivityTool,
  remove_itinerary_activity: removeItineraryActivityTool,
  reorder_itinerary_activities: reorderItineraryActivitiesTool,
  calculate_trip_budget: calculateTripBudgetTool,
  get_daily_budget: getDailyBudgetTool,
  get_budget_breakdown: getBudgetBreakdownTool,
  find_budget_savings: findBudgetSavingsTool,
};

export const getGroqToolsDefinitions = (): any[] => {
  return Object.values(toolRegistry).map((t) => t.definition);
};

export const isWriteTool = (toolName: string): boolean => {
  return toolRegistry[toolName]?.isWrite === true;
};

export const executeTool = async (toolName: string, args: any, userId: string): Promise<any> => {
  const tool = toolRegistry[toolName];
  if (!tool) {
    return {
      success: false,
      error: `Tool '${toolName}' is not registered in GlobeTrotter Agent.`,
    };
  }

  try {
    return await tool.handler(args || {}, userId);
  } catch (err: any) {
    console.error(`Execution error in tool '${toolName}':`, err);
    return {
      success: false,
      error: `Tool execution failed: ${err.message || "Unknown error"}`,
    };
  }
};
