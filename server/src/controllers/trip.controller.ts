import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Trip } from "../models/trip.models.js";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, startDate, endDate, coverPhoto, budget, visibility, destinations } = req.body;

  if (!name || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Trip name, start date, and end date are required.",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid start or end date format.",
    });
  }

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date.",
    });
  }

  let parsedBudget = { amount: 0, currency: "INR" };
  if (budget) {
    if (typeof budget === "number") {
      parsedBudget.amount = Math.max(0, budget);
    } else if (typeof budget === "object") {
      parsedBudget.amount = Math.max(0, Number(budget.amount) || 0);
      parsedBudget.currency = budget.currency || "INR";
    }
  }

  const userId = req.user._id || req.user.id;

  const now = new Date();
  let computedStatus: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" = "UPCOMING";
  if (end < now) {
    computedStatus = "COMPLETED";
  } else if (start <= now && end >= now) {
    computedStatus = "ONGOING";
  }

  const trip = await Trip.create({
    userId,
    name: name.trim(),
    description: description || "",
    startDate: start,
    endDate: end,
    coverPhoto: coverPhoto || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    budget: parsedBudget,
    status: computedStatus,
    visibility: visibility || "PRIVATE",
    destinations: Array.isArray(destinations) ? destinations : [],
  });

  const populatedTrip = await Trip.findById(trip._id).populate("destinations").populate("activities");

  return res.status(201).json({
    success: true,
    data: populatedTrip,
  });
});

// @desc    Get user's trips
// @route   GET /api/trips
// @access  Private
export const getMyTrips = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, sort = "createdAt", page = 1, limit = 20 } = req.query;

  const userId = req.user._id || req.user.id;
  const query: any = { userId };

  if (status) {
    query.status = (status as string).toUpperCase();
  }

  if (search) {
    query.name = { $regex: search as string, $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  let sortOptions: any = { createdAt: -1 };
  if (sort === "startDate") sortOptions = { startDate: 1 };
  if (sort === "name") sortOptions = { name: 1 };
  if (sort === "createdAtAsc") sortOptions = { createdAt: 1 };

  const total = await Trip.countDocuments(query);
  const trips = await Trip.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .populate("destinations")
    .populate("activities");

  return res.status(200).json({
    success: true,
    count: trips.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: trips,
  });
});

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = asyncHandler(async (req: Request, res: Response) => {
  const trip = await Trip.findById(req.params.id)
    .populate("destinations")
    .populate({
      path: "activities",
      populate: { path: "cityId", select: "name country" },
    });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const userId = req.user._id || req.user.id;

  if (trip.userId.toString() !== userId.toString() && trip.visibility !== "PUBLIC") {
    return res.status(403).json({
      success: false,
      message: "Access denied: You do not have permission to view this trip.",
    });
  }

  return res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const userId = req.user._id || req.user.id;

  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied: You can only edit your own trips.",
    });
  }

  const { name, description, startDate, endDate, coverPhoto, budget, status, visibility } = req.body;

  if (name !== undefined) trip.name = name.trim();
  if (description !== undefined) trip.description = description;
  if (coverPhoto !== undefined) trip.coverPhoto = coverPhoto;
  if (visibility !== undefined) trip.visibility = visibility;
  if (status !== undefined) trip.status = status;

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : trip.startDate;
    const end = endDate ? new Date(endDate) : trip.endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date format.",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    trip.startDate = start;
    trip.endDate = end;
  }

  if (budget !== undefined) {
    if (typeof budget === "number") {
      trip.budget.amount = Math.max(0, budget);
    } else if (typeof budget === "object") {
      if (budget.amount !== undefined) trip.budget.amount = Math.max(0, Number(budget.amount) || 0);
      if (budget.currency !== undefined) trip.budget.currency = budget.currency;
    }
  }

  await trip.save();

  const updatedTrip = await Trip.findById(trip._id).populate("destinations").populate("activities");

  return res.status(200).json({
    success: true,
    data: updatedTrip,
  });
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }

  const userId = req.user._id || req.user.id;

  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied: You can only delete your own trips.",
    });
  }

  await Trip.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Trip successfully deleted.",
  });
});

// @desc    Add city destination to trip
// @route   POST /api/trips/:tripId/destinations/:cityId
// @access  Private
export const addTripDestination = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, cityId } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const city = await City.findById(cityId);
  if (!city) {
    return res.status(404).json({ success: false, message: "City not found." });
  }

  const alreadyAdded = trip.destinations.some((id) => id.toString() === cityId);
  if (!alreadyAdded) {
    trip.destinations.push(cityId as any);
    await trip.save();
  }

  const updatedTrip = await Trip.findById(tripId).populate("destinations").populate("activities");
  return res.status(200).json({ success: true, data: updatedTrip });
});

// @desc    Remove city destination from trip
// @route   DELETE /api/trips/:tripId/destinations/:cityId
// @access  Private
export const removeTripDestination = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, cityId } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  trip.destinations = trip.destinations.filter((id) => id.toString() !== cityId);
  await trip.save();

  const updatedTrip = await Trip.findById(tripId).populate("destinations").populate("activities");
  return res.status(200).json({ success: true, data: updatedTrip });
});

// @desc    Get trip destinations
// @route   GET /api/trips/:tripId/destinations
// @access  Private
export const getTripDestinations = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId).populate("destinations");

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString() && trip.visibility !== "PUBLIC") {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  return res.status(200).json({ success: true, data: trip.destinations });
});

// @desc    Add activity to trip
// @route   POST /api/trips/:tripId/activities/:activityId
// @access  Private
export const addTripActivity = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, activityId } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const activity = await Activity.findById(activityId);
  if (!activity) {
    return res.status(404).json({ success: false, message: "Activity not found." });
  }

  const alreadyAdded = trip.activities.some((id) => id.toString() === activityId);
  if (!alreadyAdded) {
    trip.activities.push(activityId as any);
    await trip.save();
  }

  const updatedTrip = await Trip.findById(tripId).populate("destinations").populate("activities");
  return res.status(200).json({ success: true, data: updatedTrip });
});

// @desc    Remove activity from trip
// @route   DELETE /api/trips/:tripId/activities/:activityId
// @access  Private
export const removeTripActivity = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, activityId } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  trip.activities = trip.activities.filter((id) => id.toString() !== activityId);
  await trip.save();

  const updatedTrip = await Trip.findById(tripId).populate("destinations").populate("activities");
  return res.status(200).json({ success: true, data: updatedTrip });
});

// @desc    Get trip activities
// @route   GET /api/trips/:tripId/activities
// @access  Private
export const getTripActivities = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = await Trip.findById(tripId).populate("activities");

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  const userId = req.user._id || req.user.id;
  if (trip.userId.toString() !== userId.toString() && trip.visibility !== "PUBLIC") {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  return res.status(200).json({ success: true, data: trip.activities });
});
