import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

export const searchCitiesTool = {
  definition: {
    type: "function",
    function: {
      name: "search_cities",
      description: "Search real cities from the GlobeTrotter database matching filters such as region, country, costIndex, or name.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Search keyword for city name or description" },
          region: { type: "string", description: "Region (e.g. Europe, Asia, North America)" },
          country: { type: "string", description: "Country name (e.g. Japan, France, Italy)" },
          minCost: { type: "number", description: "Minimum cost index (0 - 100)" },
          maxCost: { type: "number", description: "Maximum cost index (0 - 100)" },
          limit: { type: "number", description: "Maximum number of results to return (default 10)" },
        },
        required: [],
      },
    },
  },
  handler: async (args: any) => {
    const query: any = {};

    if (args.search) {
      query.$or = [
        { name: { $regex: args.search, $options: "i" } },
        { country: { $regex: args.search, $options: "i" } },
        { region: { $regex: args.search, $options: "i" } },
      ];
    }

    if (args.region) query.region = { $regex: args.region, $options: "i" };
    if (args.country) query.country = { $regex: args.country, $options: "i" };

    if (args.minCost !== undefined || args.maxCost !== undefined) {
      query.costIndex = {};
      if (args.minCost !== undefined) query.costIndex.$gte = args.minCost;
      if (args.maxCost !== undefined) query.costIndex.$lte = args.maxCost;
    }

    const limitNum = Math.min(args.limit || 10, 20);
    const cities = await City.find(query).sort({ popularity: -1 }).limit(limitNum);

    return {
      success: true,
      count: cities.length,
      data: cities.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        country: c.country,
        region: c.region,
        description: c.description,
        costIndex: c.costIndex,
        popularity: c.popularity,
        image: c.image,
      })),
    };
  },
};

export const getCityDetailsTool = {
  definition: {
    type: "function",
    function: {
      name: "get_city_details",
      description: "Get detailed information and available activities for a specific city by cityId or city name.",
      parameters: {
        type: "object",
        properties: {
          cityId: { type: "string", description: "MongoDB ID of the city" },
          cityName: { type: "string", description: "Name of the city (e.g. Tokyo, Paris)" },
        },
        required: [],
      },
    },
  },
  handler: async (args: { cityId?: string; cityName?: string }) => {
    let city = null;
    if (args.cityId) {
      city = await City.findById(args.cityId);
    } else if (args.cityName) {
      city = await City.findOne({ name: { $regex: `^${args.cityName}$`, $options: "i" } });
    }

    if (!city) {
      return { success: false, error: "City not found in database." };
    }

    const activities = await Activity.find({ cityId: city._id as any }).sort({ popularity: -1 }).limit(10);

    return {
      success: true,
      data: {
        id: city._id.toString(),
        name: city.name,
        country: city.country,
        region: city.region,
        description: city.description,
        costIndex: city.costIndex,
        popularity: city.popularity,
        image: city.image,
        activitiesCount: activities.length,
        topActivities: activities.map((a) => ({
          id: a._id.toString(),
          name: a.name,
          type: a.type,
          cost: a.cost,
          durationMinutes: a.durationMinutes,
        })),
      },
    };
  },
};

export const recommendCitiesTool = {
  definition: {
    type: "function",
    function: {
      name: "recommend_cities",
      description: "Recommend cities based on user interest preferences, region, or target budget level.",
      parameters: {
        type: "object",
        properties: {
          region: { type: "string" },
          travelStyle: { type: "string", description: "Budget, Balanced, Luxury" },
          maxCostIndex: { type: "number" },
          limit: { type: "number" },
        },
        required: [],
      },
    },
  },
  handler: async (args: any) => {
    const query: any = {};
    if (args.region) query.region = { $regex: args.region, $options: "i" };

    if (args.travelStyle === "Budget" || (args.maxCostIndex && args.maxCostIndex <= 50)) {
      query.costIndex = { $lte: 55 };
    } else if (args.travelStyle === "Luxury") {
      query.costIndex = { $gte: 75 };
    }

    const limitNum = Math.min(args.limit || 5, 10);
    const cities = await City.find(query).sort({ popularity: -1 }).limit(limitNum);

    return {
      success: true,
      data: cities.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        country: c.country,
        region: c.region,
        costIndex: c.costIndex,
        popularity: c.popularity,
      })),
    };
  },
};
