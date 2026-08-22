import { Trip } from "../models/trip.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { Expense } from "../models/expense.models.js";
import type { ExpenseCategory } from "../interface/expense.interface.js";

export interface ICategoryCost {
  category: ExpenseCategory;
  estimated: number;
  actual: number;
  total: number;
}

export interface IDailyCost {
  date: string;
  dayNumber: number;
  estimatedCost: number;
  actualCost: number;
  dailyBudget: number;
  overBudget: boolean;
  difference: number;
}

export interface IBudgetSummary {
  plannedBudget: number;
  currency: string;
  itineraryEstimatedCost: number;
  estimatedExpensesCost: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  remainingBudget: number;
  utilizationPercentage: number;
  overBudgetDaysCount: number;
  isOverallOverBudget: boolean;
}

export interface IFullBudgetAnalysis {
  summary: IBudgetSummary;
  categoryBreakdown: Record<ExpenseCategory, ICategoryCost>;
  dailyBreakdown: IDailyCost[];
  expenses: any[];
}

export const calculateTripBudget = async (tripId: string): Promise<IFullBudgetAnalysis> => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  const [itineraryActivities, expenses] = await Promise.all([
    ItineraryActivity.find({ tripId: tripId as any }).populate({
      path: "activityId",
      select: "name type cost currency image",
    }),
    Expense.find({ tripId: tripId as any }).sort({ date: 1, createdAt: 1 }),
  ]);

  const plannedBudget = trip.budget?.amount || 0;
  const currency = trip.budget?.currency || "INR";

  // 1. Calculate Itinerary Activity estimated costs
  const itineraryEstimatedCost = itineraryActivities.reduce(
    (sum, act) => sum + (act.estimatedCost || 0),
    0
  );

  // 2. Separate expenses
  const actualExpensesCost = expenses
    .filter((e) => e.type === "ACTUAL")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Non-activity estimated expenses
  const estimatedExpensesCost = expenses
    .filter((e) => e.type === "ESTIMATED" && !e.itineraryActivityId)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalEstimatedCost = itineraryEstimatedCost + estimatedExpensesCost;
  const totalActualCost = actualExpensesCost;
  const remainingBudget = plannedBudget - totalActualCost;
  const utilizationPercentage =
    plannedBudget > 0
      ? Math.min(100, Math.round((totalActualCost / plannedBudget) * 100))
      : 0;

  // 3. Category Breakdown
  const categories: ExpenseCategory[] = ["TRANSPORT", "STAY", "ACTIVITY", "MEAL", "OTHER"];
  const categoryBreakdown: Record<ExpenseCategory, ICategoryCost> = {
    TRANSPORT: { category: "TRANSPORT", estimated: 0, actual: 0, total: 0 },
    STAY: { category: "STAY", estimated: 0, actual: 0, total: 0 },
    ACTIVITY: { category: "ACTIVITY", estimated: 0, actual: 0, total: 0 },
    MEAL: { category: "MEAL", estimated: 0, actual: 0, total: 0 },
    OTHER: { category: "OTHER", estimated: 0, actual: 0, total: 0 },
  };

  // Add itinerary activity estimated costs to ACTIVITY category
  categoryBreakdown.ACTIVITY.estimated += itineraryEstimatedCost;

  // Add expenses to category breakdown
  expenses.forEach((e) => {
    const cat = categoryBreakdown[e.category] || categoryBreakdown.OTHER;
    if (e.type === "ACTUAL") {
      cat.actual += e.amount || 0;
    } else {
      cat.estimated += e.amount || 0;
    }
  });

  // Calculate total per category (prefer actual if > 0, else estimated)
  categories.forEach((cat) => {
    const item = categoryBreakdown[cat];
    item.total = item.actual > 0 ? item.actual : item.estimated;
  });

  // 4. Daily Breakdown
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  const daysDiff = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const dailyBudget = plannedBudget > 0 ? Math.round(plannedBudget / daysDiff) : 0;

  const dailyBreakdown: IDailyCost[] = [];
  let overBudgetDaysCount = 0;

  const curr = new Date(startDate);
  for (let i = 0; i < daysDiff; i++) {
    const dateStr = curr.toISOString().split("T")[0] as string;

    // Filter activities for this date
    const dayActivities = itineraryActivities.filter((act) => {
      const actDateStr = new Date(act.date).toISOString().split("T")[0];
      return actDateStr === dateStr;
    });

    const dayActivityEstimated = dayActivities.reduce(
      (sum, act) => sum + (act.estimatedCost || 0),
      0
    );

    // Filter expenses for this date
    const dayExpenses = expenses.filter((e) => {
      const expDateStr = new Date(e.date).toISOString().split("T")[0];
      return expDateStr === dateStr;
    });

    const dayActual = dayExpenses
      .filter((e) => e.type === "ACTUAL")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const dayEstimatedExp = dayExpenses
      .filter((e) => e.type === "ESTIMATED" && !e.itineraryActivityId)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const dayEstimated = dayActivityEstimated + dayEstimatedExp;

    const currentSpent = dayActual > 0 ? dayActual : dayEstimated;
    const overBudget = dailyBudget > 0 && currentSpent > dailyBudget;
    const difference = overBudget ? currentSpent - dailyBudget : 0;

    if (overBudget) {
      overBudgetDaysCount++;
    }

    dailyBreakdown.push({
      date: dateStr,
      dayNumber: i + 1,
      estimatedCost: dayEstimated,
      actualCost: dayActual,
      dailyBudget,
      overBudget,
      difference,
    });

    curr.setDate(curr.getDate() + 1);
  }

  const summary: IBudgetSummary = {
    plannedBudget,
    currency,
    itineraryEstimatedCost,
    estimatedExpensesCost,
    totalEstimatedCost,
    totalActualCost,
    remainingBudget,
    utilizationPercentage,
    overBudgetDaysCount,
    isOverallOverBudget: plannedBudget > 0 && totalActualCost > plannedBudget,
  };

  return {
    summary,
    categoryBreakdown,
    dailyBreakdown,
    expenses,
  };
};
