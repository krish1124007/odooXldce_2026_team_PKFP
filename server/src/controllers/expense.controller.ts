import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Trip } from "../models/trip.models.js";
import { TripStop } from "../models/tripStop.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { Expense } from "../models/expense.models.js";
import { calculateTripBudget } from "../services/budgetService.js";

// Helper to check trip ownership
const checkTripOwnership = async (tripId: string, userId: string) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return { trip: null, authorized: false, status: 404, message: "Trip not found." };
  }
  if (trip.userId.toString() !== userId.toString()) {
    return { trip, authorized: false, status: 403, message: "Access denied: You do not own this trip." };
  }
  return { trip, authorized: true, status: 200, message: "OK" };
};

// @desc    Update planned trip budget
// @route   PUT /api/trips/:tripId/budget
// @access  Private
export const updateTripBudget = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user._id || req.user.id;

  const { amount, currency } = req.body;

  if (amount === undefined || Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Planned budget amount must be a non-negative number.",
    });
  }

  const { trip, authorized, status, message } = await checkTripOwnership(tripId as string, userId.toString());
  if (!authorized || !trip) {
    return res.status(status).json({ success: false, message });
  }

  trip.budget.amount = Math.max(0, Number(amount));
  if (currency) {
    trip.budget.currency = currency.trim();
  }

  await trip.save();

  const budgetAnalysis = await calculateTripBudget(tripId as string);

  return res.status(200).json({
    success: true,
    message: "Trip budget updated successfully.",
    data: budgetAnalysis,
  });
});

// @desc    Get trip budget calculation summary
// @route   GET /api/trips/:tripId/budget
// @access  Private (or Public for shared trips)
export const getTripBudget = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId);

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user?._id || req.user?.id;
  const isOwner = userId && trip.userId.toString() === userId.toString();
  const isPublic = trip.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const budgetAnalysis = await calculateTripBudget(tripId as string);

  // If public viewer and not owner, omit raw user actual expense descriptions for privacy
  if (!isOwner && isPublic) {
    budgetAnalysis.expenses = [];
  }

  return res.status(200).json({
    success: true,
    data: budgetAnalysis,
  });
});

// @desc    Add expense to trip
// @route   POST /api/trips/:tripId/expenses
// @access  Private
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user._id || req.user.id;

  const { category, description, amount, currency, date, type, stopId, itineraryActivityId } = req.body;

  if (!category || !description || amount === undefined || !date) {
    return res.status(400).json({
      success: false,
      message: "Category, description, amount, and date are required.",
    });
  }

  if (Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Expense amount must be a non-negative number.",
    });
  }

  const validCategories = ["TRANSPORT", "STAY", "ACTIVITY", "MEAL", "OTHER"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category. Must be one of: TRANSPORT, STAY, ACTIVITY, MEAL, OTHER.",
    });
  }

  const validTypes = ["ESTIMATED", "ACTUAL"];
  const expType = type ? type.toUpperCase() : "ACTUAL";
  if (!validTypes.includes(expType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid expense type. Must be ESTIMATED or ACTUAL.",
    });
  }

  const { authorized, status, message } = await checkTripOwnership(tripId as string, userId.toString());
  if (!authorized) {
    return res.status(status).json({ success: false, message });
  }

  // Optional Stop verification
  if (stopId) {
    const stop = await TripStop.findById(stopId);
    if (!stop || stop.tripId.toString() !== tripId) {
      return res.status(400).json({
        success: false,
        message: "Invalid stopId: Stop does not belong to this trip.",
      });
    }
  }

  // Optional Itinerary Activity verification
  if (itineraryActivityId) {
    const act = await ItineraryActivity.findById(itineraryActivityId);
    if (!act || act.tripId.toString() !== tripId) {
      return res.status(400).json({
        success: false,
        message: "Invalid itineraryActivityId: Activity does not belong to this trip.",
      });
    }
  }

  const expense = await Expense.create({
    tripId: tripId as any,
    stopId: stopId ? (stopId as any) : undefined,
    itineraryActivityId: itineraryActivityId ? (itineraryActivityId as any) : undefined,
    category,
    description: description.trim(),
    amount: Number(amount),
    currency: currency || "INR",
    date: new Date(date),
    type: expType,
  } as any);

  const updatedBudget = await calculateTripBudget(tripId as string);

  return res.status(201).json({
    success: true,
    message: "Expense created successfully.",
    data: expense,
    budgetSummary: updatedBudget.summary,
  });
});

// @desc    Get expenses for a trip
// @route   GET /api/trips/:tripId/expenses
// @access  Private
export const getTripExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user._id || req.user.id;

  const { authorized, status, message } = await checkTripOwnership(tripId as string, userId.toString());
  if (!authorized) {
    return res.status(status).json({ success: false, message });
  }

  const expenses = await Expense.find({ tripId: tripId as any })
    .populate({ path: "stopId", populate: { path: "cityId", select: "name" } })
    .populate("itineraryActivityId")
    .sort({ date: 1, createdAt: 1 });

  return res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
});

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id)
    .populate({ path: "stopId", populate: { path: "cityId", select: "name" } })
    .populate("itineraryActivityId");

  if (!expense) {
    return res.status(404).json({ success: false, message: "Expense not found." });
  }

  const userId = req.user._id || req.user.id;
  const { authorized, status, message } = await checkTripOwnership(expense.tripId.toString(), userId.toString());
  if (!authorized) {
    return res.status(status).json({ success: false, message });
  }

  return res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ success: false, message: "Expense not found." });
  }

  const userId = req.user._id || req.user.id;
  const { authorized, status, message } = await checkTripOwnership(expense.tripId.toString(), userId.toString());
  if (!authorized) {
    return res.status(status).json({ success: false, message });
  }

  const { category, description, amount, currency, date, type, stopId, itineraryActivityId } = req.body;

  if (category !== undefined) {
    const validCategories = ["TRANSPORT", "STAY", "ACTIVITY", "MEAL", "OTHER"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category." });
    }
    expense.category = category;
  }

  if (description !== undefined) expense.description = description.trim();

  if (amount !== undefined) {
    if (Number(amount) < 0) {
      return res.status(400).json({ success: false, message: "Amount must be >= 0." });
    }
    expense.amount = Number(amount);
  }

  if (currency !== undefined) expense.currency = currency;
  if (date !== undefined) expense.date = new Date(date);

  if (type !== undefined) {
    const validTypes = ["ESTIMATED", "ACTUAL"];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, message: "Invalid expense type." });
    }
    expense.type = type.toUpperCase();
  }

  if (stopId !== undefined) (expense as any).stopId = stopId || undefined;
  if (itineraryActivityId !== undefined) (expense as any).itineraryActivityId = itineraryActivityId || undefined;

  await expense.save();

  const updatedBudget = await calculateTripBudget(expense.tripId.toString());

  return res.status(200).json({
    success: true,
    message: "Expense updated successfully.",
    data: expense,
    budgetSummary: updatedBudget.summary,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({ success: false, message: "Expense not found." });
  }

  const userId = req.user._id || req.user.id;
  const { authorized, status, message } = await checkTripOwnership(expense.tripId.toString(), userId.toString());
  if (!authorized) {
    return res.status(status).json({ success: false, message });
  }

  const tripId = expense.tripId.toString();
  await Expense.findByIdAndDelete(req.params.id);

  const updatedBudget = await calculateTripBudget(tripId);

  return res.status(200).json({
    success: true,
    message: "Expense deleted successfully.",
    budgetSummary: updatedBudget.summary,
  });
});
