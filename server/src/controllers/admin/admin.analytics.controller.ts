import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { returnResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.models.js";
import { Trip } from "../../models/trip.models.js";
import { City } from "../../models/city.models.js";
import { Activity } from "../../models/activity.models.js";
import { TripStop } from "../../models/tripStop.models.js";
import { ItineraryActivity } from "../../models/itineraryActivity.models.js";
import { AIUsage } from "../../models/aiUsage.models.js";

// @desc    Get Platform Overview KPI Metrics
// @route   GET /api/admin/overview
// @access  Private (ADMIN)
export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const [users, trips, publicTrips, destinations, activities, aiRequests] = await Promise.all([
    User.countDocuments(),
    Trip.countDocuments(),
    Trip.countDocuments({ visibility: "PUBLIC" }),
    City.countDocuments(),
    Activity.countDocuments(),
    AIUsage.countDocuments(),
  ]);

  return returnResponse(res, 200, "Platform overview metrics fetched successfully", {
    users,
    trips,
    publicTrips,
    destinations,
    activities,
    aiRequests,
  });
});

// @desc    Get Paginated User List with Filters & Trip Counts
// @route   GET /api/admin/users
// @access  Private (ADMIN)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string || "").trim();
  const role = req.query.role as string;

  const matchQuery: any = {};

  if (search) {
    matchQuery.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role && (role === "USER" || role === "ADMIN")) {
    matchQuery.role = role;
  }

  const totalUsers = await User.countDocuments(matchQuery);
  const totalPages = Math.ceil(totalUsers / limit) || 1;

  const usersAggregation = await User.aggregate([
    { $match: matchQuery },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: "trips",
        localField: "_id",
        foreignField: "userId",
        as: "userTrips",
      },
    },
    {
      $project: {
        passwordHash: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
        __v: 0,
      },
    },
    {
      $addFields: {
        id: "$_id",
        tripCount: { $size: "$userTrips" },
      },
    },
    {
      $project: {
        userTrips: 0,
      },
    },
  ]);

  return returnResponse(res, 200, "Users retrieved successfully", {
    users: usersAggregation,
    pagination: {
      total: totalUsers,
      page,
      limit,
      totalPages,
    },
  });
});

// @desc    Toggle User Active Status (Enable / Disable)
// @route   PATCH /api/admin/users/:userId/status
// @access  Private (ADMIN)
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Boolean 'isActive' field is required.",
    });
  }

  const currentAdminId = req.user?._id?.toString() || req.user?.id;
  if (currentAdminId === userId && !isActive) {
    return res.status(400).json({
      success: false,
      message: "You cannot disable your own admin account.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  return returnResponse(res, 200, `User account ${isActive ? "enabled" : "disabled"} successfully`, updatedUser);
});

// @desc    Update User Role (USER / ADMIN)
// @route   PATCH /api/admin/users/:userId/role
// @access  Private (ADMIN)
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role || (role !== "USER" && role !== "ADMIN")) {
    return res.status(400).json({
      success: false,
      message: "Valid 'role' ('USER' or 'ADMIN') is required.",
    });
  }

  const currentAdminId = req.user?._id?.toString() || req.user?.id;
  if (currentAdminId === userId && role !== "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "You cannot remove admin privileges from your own account.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  return returnResponse(res, 200, `User role updated to ${role} successfully`, updatedUser);
});

// @desc    Get Detailed Trip Analytics
// @route   GET /api/admin/trips
// @access  Private (ADMIN)
export const getTripAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const totalTrips = await Trip.countDocuments();
  const publicTrips = await Trip.countDocuments({ visibility: "PUBLIC" });
  const privateTrips = totalTrips - publicTrips;

  // Trips created over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const creationTrend = await Trip.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Average budget and duration metrics
  const tripStats = await Trip.aggregate([
    {
      $project: {
        budget: "$budget.total",
        durationDays: {
          $divide: [
            { $subtract: [{ $toDate: "$endDate" }, { $toDate: "$startDate" }] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgBudget: { $avg: "$budget" },
        avgDurationDays: { $avg: "$durationDays" },
      },
    },
  ]);

  return returnResponse(res, 200, "Trip analytics retrieved successfully", {
    totalTrips,
    publicTrips,
    privateTrips,
    avgBudget: Math.round(tripStats[0]?.avgBudget || 0),
    avgDurationDays: Math.round((tripStats[0]?.avgDurationDays || 0) * 10) / 10,
    creationTrend,
  });
});

// @desc    Get Platform Analytics (Popular Cities, Activities & User Growth)
// @route   GET /api/admin/analytics
// @access  Private (ADMIN)
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Popular Cities by actual TripStop occurrences
  const popularCities = await TripStop.aggregate([
    {
      $group: {
        _id: "$cityName",
        tripCount: { $sum: 1 },
      },
    },
    { $sort: { tripCount: -1 } },
    { $limit: 10 },
  ]);

  // Popular Activities by actual ItineraryActivity occurrences
  const popularActivities = await ItineraryActivity.aggregate([
    {
      $group: {
        _id: "$name",
        type: { $first: "$type" },
        cost: { $first: "$cost" },
        selectionCount: { $sum: 1 },
      },
    },
    { $sort: { selectionCount: -1 } },
    { $limit: 10 },
  ]);

  // User Growth Over Time
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return returnResponse(res, 200, "Platform analytics fetched successfully", {
    popularCities: popularCities.map((c) => ({ cityName: c._id || "Unknown", count: c.tripCount })),
    popularActivities: popularActivities.map((a) => ({ name: a._id || "Unknown", type: a.type, cost: a.cost, count: a.selectionCount })),
    userGrowth,
  });
});

// @desc    Get AI Agent Usage Analytics
// @route   GET /api/admin/ai-analytics
// @access  Private (ADMIN)
export const getAIAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const totalRequests = await AIUsage.countDocuments();
  const successfulRequests = await AIUsage.countDocuments({ success: true });
  const failedRequests = totalRequests - successfulRequests;

  const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 1000) / 10 : 100;

  const stats = await AIUsage.aggregate([
    {
      $group: {
        _id: null,
        avgDurationMs: { $avg: "$durationMs" },
        avgToolCalls: { $avg: "$toolCalls" },
      },
    },
  ]);

  const avgResponseTimeSec = stats[0]?.avgDurationMs ? Math.round((stats[0].avgDurationMs / 1000) * 10) / 10 : 1.5;
  const avgToolsPerRequest = stats[0]?.avgToolCalls ? Math.round(stats[0].avgToolCalls * 10) / 10 : 2.1;

  // Requests over time (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyRequests = await AIUsage.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        successful: { $sum: { $cond: ["$success", 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return returnResponse(res, 200, "AI agent analytics retrieved successfully", {
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate,
    avgResponseTimeSec,
    avgToolsPerRequest,
    dailyRequests,
  });
});
