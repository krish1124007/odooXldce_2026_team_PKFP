import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

// @desc    Get all cities with search, filter, pagination
// @route   GET /api/cities
// @access  Public
export const getCities = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    country,
    region,
    minCost,
    maxCost,
    minPopularity,
    maxPopularity,
    sort = "popularity",
    page = 1,
    limit = 20,
  } = req.query;

  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: "i" } },
      { country: { $regex: search as string, $options: "i" } },
      { region: { $regex: search as string, $options: "i" } },
    ];
  }

  if (country) {
    query.country = { $regex: `^${country as string}$`, $options: "i" };
  }

  if (region) {
    query.region = { $regex: `^${region as string}$`, $options: "i" };
  }

  if (minCost || maxCost) {
    query.costIndex = {};
    if (minCost) query.costIndex.$gte = Number(minCost);
    if (maxCost) query.costIndex.$lte = Number(maxCost);
  }

  if (minPopularity || maxPopularity) {
    query.popularity = {};
    if (minPopularity) query.popularity.$gte = Number(minPopularity);
    if (maxPopularity) query.popularity.$lte = Number(maxPopularity);
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  let sortOptions: any = { popularity: -1 };
  if (sort === "costAsc") sortOptions = { costIndex: 1 };
  if (sort === "costDesc") sortOptions = { costIndex: -1 };
  if (sort === "name") sortOptions = { name: 1 };
  if (sort === "popularityAsc") sortOptions = { popularity: 1 };

  const total = await City.countDocuments(query);
  const cities = await City.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return res.status(200).json({
    success: true,
    count: cities.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: cities,
  });
});

// @desc    Get single city by ID with associated activities
// @route   GET /api/cities/:id
// @access  Public
export const getCityById = asyncHandler(async (req: Request, res: Response) => {
  const city = await City.findById(req.params.id);

  if (!city) {
    return res.status(404).json({
      success: false,
      message: "City not found.",
    });
  }

  const activities = await Activity.find({ cityId: city._id as any }).sort({ popularity: -1 });

  return res.status(200).json({
    success: true,
    data: {
      ...city.toObject(),
      activities,
    },
  });
});
