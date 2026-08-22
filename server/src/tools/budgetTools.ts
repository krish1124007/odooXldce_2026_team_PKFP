import { Trip } from "../models/trip.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { Activity } from "../models/activity.models.js";
import { calculateTripBudget } from "../services/budgetService.js";

// READ: calculate_trip_budget
export const calculateTripBudgetTool = {
  definition: {
    type: "function",
    function: {
      name: "calculate_trip_budget",
      description: "Perform deterministic budget calculation for a trip using actual recorded costs and estimated activities.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "MongoDB ID of the trip" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const analysis = await calculateTripBudget(args.tripId);
    return {
      success: true,
      data: {
        plannedBudget: analysis.summary.plannedBudget,
        currency: analysis.summary.currency,
        totalEstimatedCost: analysis.summary.totalEstimatedCost,
        totalActualCost: analysis.summary.totalActualCost,
        remainingBudget: analysis.summary.remainingBudget,
        utilizationPercentage: analysis.summary.utilizationPercentage,
        overBudgetDaysCount: analysis.summary.overBudgetDaysCount,
        isOverallOverBudget: analysis.summary.isOverallOverBudget,
      },
    };
  },
};

// READ: get_daily_budget
export const getDailyBudgetTool = {
  definition: {
    type: "function",
    function: {
      name: "get_daily_budget",
      description: "Retrieve day-by-day budget breakdown and over-budget day alerts for a trip.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const analysis = await calculateTripBudget(args.tripId);
    return {
      success: true,
      data: analysis.dailyBreakdown,
    };
  },
};

// READ: get_budget_breakdown
export const getBudgetBreakdownTool = {
  definition: {
    type: "function",
    function: {
      name: "get_budget_breakdown",
      description: "Retrieve category breakdown (TRANSPORT, STAY, ACTIVITY, MEAL, OTHER) for a trip budget.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const analysis = await calculateTripBudget(args.tripId);
    return {
      success: true,
      data: analysis.categoryBreakdown,
    };
  },
};

// READ / OPTIMIZATION: find_budget_savings
export const findBudgetSavingsTool = {
  definition: {
    type: "function",
    function: {
      name: "find_budget_savings",
      description: "Analyze current trip activities, find expensive items, search real cheaper alternatives in database, and compute deterministic savings potential.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "MongoDB ID of the trip" },
          targetBudget: { type: "number", description: "Optional target budget limit to reach" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string; targetBudget?: number }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const analysis = await calculateTripBudget(args.tripId);
    const currentTotal = analysis.summary.totalEstimatedCost > 0 ? analysis.summary.totalEstimatedCost : analysis.summary.plannedBudget;
    const target = args.targetBudget || trip.budget?.amount || 0;
    const neededSavings = target > 0 && currentTotal > target ? currentTotal - target : 0;

    const scheduled = await ItineraryActivity.find({ tripId: args.tripId as any })
      .populate("activityId")
      .populate({ path: "stopId", populate: { path: "cityId", select: "name" } });

    // Filter activities with cost > 0
    const expensiveItems = scheduled
      .filter((item: any) => item.activityId && ((item.activityId as any).cost > 0 || item.estimatedCost > 0))
      .sort((a: any, b: any) => ((b.activityId as any)?.cost || b.estimatedCost) - ((a.activityId as any)?.cost || a.estimatedCost));

    const recommendations: any[] = [];
    let accumulatedSavings = 0;

    for (const item of expensiveItems) {
      const act = item.activityId as any;
      const currentCost = act?.cost || item.estimatedCost || 0;
      const cityId = act?.cityId || (item.stopId as any)?.cityId;

      if (!act) continue;

      // Find cheaper activity in same city
      const alternatives = await Activity.find({
        _id: { $ne: act._id },
        cityId: cityId as any,
        cost: { $lt: currentCost },
      }).sort({ cost: 1, popularity: -1 }).limit(3);

      if (alternatives && alternatives.length > 0) {
        const bestAlt = alternatives[0];
        if (bestAlt) {
          const potentialSaving = currentCost - bestAlt.cost;
          accumulatedSavings += potentialSaving;

          recommendations.push({
            itineraryActivityId: item._id.toString(),
            currentActivity: {
              id: act._id.toString(),
              name: act.name,
              cost: currentCost,
              type: act.type,
            },
            alternativeActivity: {
              id: bestAlt._id.toString(),
              name: bestAlt.name,
              cost: bestAlt.cost,
              type: bestAlt.type,
              durationMinutes: bestAlt.durationMinutes,
            },
            potentialSaving,
          });
        }
      }
    }

    return {
      success: true,
      data: {
        tripId: trip._id.toString(),
        currentTotalCost: currentTotal,
        targetBudget: target,
        neededSavings,
        totalPotentialSavings: accumulatedSavings,
        projectedNewTotal: Math.max(0, currentTotal - accumulatedSavings),
        recommendations,
      },
    };
  },
};
