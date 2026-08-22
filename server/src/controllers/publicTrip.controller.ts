import type { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Trip } from "../models/trip.models.js";
import { TripStop } from "../models/tripStop.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { calculateTripBudget } from "../services/budgetService.js";

// Helper to generate a clean, safe publicId
const generatePublicId = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const randomHex = crypto.randomBytes(4).toString("hex");
  return `${slug || "trip"}-${randomHex}`;
};

// @desc    Publish a trip (make public and generate publicId)
// @route   PUT /api/trips/:tripId/publish
// @access  Private
export const publishTrip = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user._id || req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied: Only trip owner can publish." });
  }

  trip.visibility = "PUBLIC";
  if (!trip.publicId) {
    let newPublicId = generatePublicId(trip.name);
    // Ensure uniqueness
    let existing = await Trip.findOne({ publicId: newPublicId });
    while (existing) {
      newPublicId = generatePublicId(trip.name);
      existing = await Trip.findOne({ publicId: newPublicId });
    }
    trip.publicId = newPublicId;
  }

  await trip.save();

  const publicUrl = `/public/trips/${trip.publicId}`;

  return res.status(200).json({
    success: true,
    message: "Trip published successfully.",
    data: {
      tripId: trip._id,
      visibility: trip.visibility,
      publicId: trip.publicId,
      publicUrl,
    },
  });
});

// @desc    Unpublish a trip (make private)
// @route   PUT /api/trips/:tripId/unpublish
// @access  Private
export const unpublishTrip = asyncHandler(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user._id || req.user.id;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found." });
  }

  if (trip.userId.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Access denied: Only trip owner can unpublish." });
  }

  trip.visibility = "PRIVATE";
  await trip.save();

  return res.status(200).json({
    success: true,
    message: "Trip unpublished and is now private.",
    data: {
      tripId: trip._id,
      visibility: trip.visibility,
    },
  });
});

// @desc    Get all public community trips (Search & Pagination)
// @route   GET /api/public/trips
// @access  Public
export const getPublicTrips = asyncHandler(async (req: Request, res: Response) => {
  const { search, sort = "newest", page = 1, limit = 12 } = req.query;

  const query: any = { visibility: "PUBLIC" };

  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: "i" } },
      { description: { $regex: search as string, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  let sortOption: any = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "startDate") sortOption = { startDate: 1 };
  if (sort === "name") sortOption = { name: 1 };

  const total = await Trip.countDocuments(query);
  const trips = await Trip.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .populate("destinations")
    .populate({
      path: "userId",
      select: "firstName lastName profilePhoto",
    });

  // Format safe public output
  const safeTrips = trips.map((trip: any) => {
    const creator = trip.userId
      ? `Planned by ${trip.userId.firstName} ${trip.userId.lastName ? trip.userId.lastName[0] + "." : ""}`
      : "Planned by Traveler";

    return {
      id: trip._id,
      publicId: trip.publicId || trip._id.toString(),
      name: trip.name,
      description: trip.description,
      coverPhoto: trip.coverPhoto,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status,
      destinationsCount: trip.destinations ? trip.destinations.length : 0,
      destinations: trip.destinations,
      budget: trip.budget,
      creator,
      createdAt: trip.createdAt,
    };
  });

  return res.status(200).json({
    success: true,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    data: safeTrips,
  });
});

// @desc    Get single public trip by publicId
// @route   GET /api/public/trips/:publicId
// @access  Public
export const getPublicTripByPublicId = asyncHandler(async (req: Request, res: Response) => {
  const publicIdStr = (req.params.publicId || "") as string;
  const isMongoId = mongoose.Types.ObjectId.isValid(publicIdStr);

  const queryConditions: any[] = [{ publicId: publicIdStr }];
  if (isMongoId) {
    queryConditions.push({ _id: publicIdStr });
  }

  const trip = await Trip.findOne({
    $or: queryConditions,
    visibility: "PUBLIC",
  } as any)
    .populate("destinations")
    .populate({
      path: "activities",
      populate: { path: "cityId", select: "name country" },
    })
    .populate({
      path: "userId",
      select: "firstName lastName profilePhoto",
    });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Public trip not found or is private.",
    });
  }

  // Fetch stops and itinerary activities
  const stops = await TripStop.find({ tripId: trip._id })
    .sort({ order: 1 })
    .populate("cityId");

  const stopIds = stops.map((s) => s._id);
  const itineraryActivities = await ItineraryActivity.find({ stopId: { $in: stopIds } })
    .sort({ order: 1, startTime: 1 })
    .populate({
      path: "activityId",
      select: "name type cost currency durationMinutes image description",
    });

  // Calculate budget summary
  const budgetAnalysis = await calculateTripBudget(trip._id.toString());

  const creatorName = (trip.userId as any)
    ? `Planned by ${(trip.userId as any).firstName} ${(trip.userId as any).lastName ? (trip.userId as any).lastName[0] + "." : ""}`
    : "Planned by Traveler";

  const safePublicTrip = {
    id: trip._id,
    publicId: trip.publicId || trip._id.toString(),
    name: trip.name,
    description: trip.description,
    coverPhoto: trip.coverPhoto,
    startDate: trip.startDate,
    endDate: trip.endDate,
    status: trip.status,
    budget: trip.budget,
    estimatedTotalCost: budgetAnalysis.summary.totalEstimatedCost,
    destinations: trip.destinations,
    stops: stops.map((stop) => ({
      id: stop._id,
      city: stop.cityId,
      startDate: stop.startDate,
      endDate: stop.endDate,
      order: stop.order,
      notes: stop.notes || "",
      activities: itineraryActivities.filter((act) => act.stopId.toString() === stop._id.toString()),
    })),
    creator: {
      name: creatorName,
      profilePhoto: (trip.userId as any)?.profilePhoto || "",
    },
    createdAt: trip.createdAt,
  };

  return res.status(200).json({
    success: true,
    data: safePublicTrip,
  });
});

// @desc    Copy a public trip into user's own account
// @route   POST /api/public/trips/:publicId/copy
// @access  Private
export const copyPublicTrip = asyncHandler(async (req: Request, res: Response) => {
  const publicIdStr = (req.params.publicId || "") as string;
  const userId = req.user._id || req.user.id;
  const { name, startDate, endDate } = req.body || {};

  const isMongoId = mongoose.Types.ObjectId.isValid(publicIdStr);

  const queryConditions: any[] = [{ publicId: publicIdStr }];
  if (isMongoId) {
    queryConditions.push({ _id: publicIdStr });
  }

  // 1. Verify original trip exists and is PUBLIC
  const originalTrip = await Trip.findOne({
    $or: queryConditions,
    visibility: "PUBLIC",
  } as any);

  if (!originalTrip) {
    return res.status(404).json({
      success: false,
      message: "Public trip not found or is no longer public.",
    });
  }

  // 2. Calculate Date Offset
  let newStart = startDate ? new Date(startDate) : new Date();
  let newEnd: Date;

  const originalStart = new Date(originalTrip.startDate);
  const originalEnd = new Date(originalTrip.endDate);
  const tripDurationMs = originalEnd.getTime() - originalStart.getTime();

  if (endDate) {
    newEnd = new Date(endDate);
  } else {
    newEnd = new Date(newStart.getTime() + tripDurationMs);
  }

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid date format for copy." });
  }

  const dateOffsetMs = newStart.getTime() - originalStart.getTime();

  // 3. Create New Copied Trip (Private by default, owned by req.user)
  const copiedTrip = await Trip.create({
    userId,
    name: name ? name.trim() : `${originalTrip.name} (Copy)`,
    description: originalTrip.description,
    coverPhoto: originalTrip.coverPhoto,
    startDate: newStart,
    endDate: newEnd,
    status: "UPCOMING",
    visibility: "PRIVATE",
    isCopiedFromPublic: true,
    originalPublicId: originalTrip.publicId || String(originalTrip._id),
    budget: {
      amount: originalTrip.budget?.amount || 0,
      currency: originalTrip.budget?.currency || "INR",
    },
    destinations: originalTrip.destinations,
    activities: originalTrip.activities,
  });

  // 4. Copy Stops and Itinerary Activities with shifted dates
  const originalStops = await TripStop.find({ tripId: originalTrip._id }).sort({ order: 1 });

  for (const origStop of originalStops) {
    const shiftedStopStart = new Date(new Date(origStop.startDate).getTime() + dateOffsetMs);
    const shiftedStopEnd = new Date(new Date(origStop.endDate).getTime() + dateOffsetMs);

    const newStop = await TripStop.create({
      tripId: copiedTrip._id,
      cityId: origStop.cityId,
      startDate: shiftedStopStart,
      endDate: shiftedStopEnd,
      order: origStop.order,
      notes: origStop.notes || "",
    });

    const origActivities = await ItineraryActivity.find({ stopId: origStop._id }).sort({ order: 1 });

    for (const origAct of origActivities) {
      const shiftedActDate = new Date(new Date(origAct.date).getTime() + dateOffsetMs);

      await ItineraryActivity.create({
        tripId: copiedTrip._id,
        stopId: newStop._id,
        activityId: origAct.activityId,
        date: shiftedActDate,
        startTime: origAct.startTime,
        endTime: origAct.endTime,
        order: origAct.order,
        notes: origAct.notes || "",
        estimatedCost: origAct.estimatedCost,
      });
    }
  }

  const populatedCopiedTrip = await Trip.findById(copiedTrip._id)
    .populate("destinations")
    .populate("activities");

  return res.status(201).json({
    success: true,
    message: "Trip copied successfully to your account!",
    data: populatedCopiedTrip,
  });
});
