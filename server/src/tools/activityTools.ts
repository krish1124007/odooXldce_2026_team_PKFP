import { Activity } from "../models/activity.models.js";
import { City } from "../models/city.models.js";

export const searchActivitiesTool = {
  definition: {
    type: "function",
    function: {
      name: "search_activities",
      description: "Search activities from the GlobeTrotter database matching filters like cityId, search, type, maxCost, maxDuration.",
      parameters: {
        type: "object",
        properties: {
          cityId: { type: "string", description: "Filter by city ID" },
          cityName: { type: "string", description: "Filter by city name (e.g. Tokyo, Paris)" },
          search: { type: "string", description: "Search keyword in activity name or description" },
          type: { type: "string", description: "Category (Sightseeing, Food, Adventure, Culture, Nature, Shopping, Nightlife, Photography)" },
          minCost: { type: "number", description: "Minimum cost in INR" },
          maxCost: { type: "number", description: "Maximum cost in INR" },
          minDuration: { type: "number", description: "Minimum duration in minutes" },
          maxDuration: { type: "number", description: "Maximum duration in minutes" },
          limit: { type: "number", description: "Maximum results (default 10)" },
        },
        required: [],
      },
    },
  },
  handler: async (args: any) => {
    const query: any = {};

    if (args.cityId) {
      query.cityId = args.cityId;
    } else if (args.cityName) {
      const city = await City.findOne({ name: { $regex: `^${args.cityName}$`, $options: "i" } });
      if (city) query.cityId = city._id;
    }

    if (args.search) {
      query.$or = [
        { name: { $regex: args.search, $options: "i" } },
        { description: { $regex: args.search, $options: "i" } },
      ];
    }

    if (args.type) query.type = { $regex: args.type, $options: "i" };

    if (args.minCost !== undefined || args.maxCost !== undefined) {
      query.cost = {};
      if (args.minCost !== undefined) query.cost.$gte = args.minCost;
      if (args.maxCost !== undefined) query.cost.$lte = args.maxCost;
    }

    if (args.minDuration !== undefined || args.maxDuration !== undefined) {
      query.durationMinutes = {};
      if (args.minDuration !== undefined) query.durationMinutes.$gte = args.minDuration;
      if (args.maxDuration !== undefined) query.durationMinutes.$lte = args.maxDuration;
    }

    const limitNum = Math.min(args.limit || 10, 20);
    const activities = await Activity.find(query).populate("cityId", "name country").sort({ popularity: -1 }).limit(limitNum);

    return {
      success: true,
      count: activities.length,
      data: activities.map((a: any) => ({
        id: a._id.toString(),
        name: a.name,
        type: a.type,
        cost: a.cost,
        durationMinutes: a.durationMinutes,
        description: a.description,
        cityName: a.cityId?.name || "Unknown",
        popularity: a.popularity,
      })),
    };
  },
};

export const getActivityDetailsTool = {
  definition: {
    type: "function",
    function: {
      name: "get_activity_details",
      description: "Retrieve complete information for a specific activity by activityId.",
      parameters: {
        type: "object",
        properties: {
          activityId: { type: "string", description: "MongoDB ID of the activity" },
        },
        required: ["activityId"],
      },
    },
  },
  handler: async (args: { activityId: string }) => {
    const activity = await Activity.findById(args.activityId).populate("cityId", "name country region");
    if (!activity) {
      return { success: false, error: "Activity not found." };
    }
    return {
      success: true,
      data: activity,
    };
  },
};

export const recommendActivitiesTool = {
  definition: {
    type: "function",
    function: {
      name: "recommend_activities",
      description: "Recommend top-rated activities based on interests, maximum cost, or max duration.",
      parameters: {
        type: "object",
        properties: {
          cityName: { type: "string" },
          interests: { type: "array", items: { type: "string" } },
          maxCost: { type: "number" },
          limit: { type: "number" },
        },
        required: [],
      },
    },
  },
  handler: async (args: any) => {
    const query: any = {};
    if (args.cityName) {
      const city = await City.findOne({ name: { $regex: `^${args.cityName}$`, $options: "i" } });
      if (city) query.cityId = city._id;
    }

    if (args.interests && Array.isArray(args.interests) && args.interests.length > 0) {
      query.type = { $in: args.interests.map((i: string) => new RegExp(i, "i")) };
    }

    if (args.maxCost !== undefined) {
      query.cost = { $lte: args.maxCost };
    }

    const limitNum = Math.min(args.limit || 5, 10);
    const activities = await Activity.find(query).populate("cityId", "name").sort({ popularity: -1 }).limit(limitNum);

    return {
      success: true,
      data: activities.map((a: any) => ({
        id: a._id.toString(),
        name: a.name,
        type: a.type,
        cost: a.cost,
        durationMinutes: a.durationMinutes,
        cityName: a.cityId?.name,
      })),
    };
  },
};
