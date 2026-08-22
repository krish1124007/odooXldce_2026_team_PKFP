import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Activity } from "../models/activity.models.js";

// @desc    Get all activities with filtering
// @route   GET /api/activities
// @access  Public
export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const {
    cityId,
    search,
    type,
    minCost,
    maxCost,
    minDuration,
    maxDuration,
    sort = "popularity",
    page = 1,
    limit = 30,
  } = req.query;

  const query: any = {};

  if (cityId) {
    query.cityId = cityId;
  }

  if (search) {
    query.name = { $regex: search as string, $options: "i" };
  }

  if (type) {
    query.type = type;
  }

  if (minCost || maxCost) {
    query.cost = {};
    if (minCost) query.cost.$gte = Number(minCost);
    if (maxCost) query.cost.$lte = Number(maxCost);
  }

  if (minDuration || maxDuration) {
    query.durationMinutes = {};
    if (minDuration) query.durationMinutes.$gte = Number(minDuration);
    if (maxDuration) query.durationMinutes.$lte = Number(maxDuration);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  let sortOptions: any = { popularity: -1 };
  if (sort === "costAsc") sortOptions = { cost: 1 };
  if (sort === "costDesc") sortOptions = { cost: -1 };
  if (sort === "durationAsc") sortOptions = { durationMinutes: 1 };
  if (sort === "name") sortOptions = { name: 1 };

  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .populate("cityId", "name country")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return res.status(200).json({
    success: true,
    count: activities.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: activities,
  });
});

// @desc    Get single activity by ID
// @route   GET /api/activities/:id
// @access  Public
export const getActivityById = asyncHandler(async (req: Request, res: Response) => {
  const activity = await Activity.findById(req.params.id).populate("cityId", "name country region image");

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found.",
    });
  }

  return res.status(200).json({
    success: true,
    data: activity,
  });
});
