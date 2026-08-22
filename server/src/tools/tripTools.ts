import { Trip } from "../models/trip.models.js";
import { City } from "../models/city.models.js";

export const getTripTool = {
  definition: {
    type: "function",
    function: {
      name: "get_trip",
      description: "Retrieve details of a specific trip owned by the authenticated user.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "The MongoDB ID of the trip" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] })
      .populate("destinations", "name country region image costIndex")
      .populate("activities", "name type cost durationMinutes cityId");

    if (!trip) {
      return { success: false, error: "Trip not found or access denied." };
    }

    return {
      success: true,
      data: {
        id: trip._id.toString(),
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        status: trip.status,
        visibility: trip.visibility,
        destinations: trip.destinations,
        activitiesCount: trip.activities?.length || 0,
        coverPhoto: trip.coverPhoto,
      },
    };
  },
};

export const createTripTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "create_trip",
      description: "Create a new trip for the user. Proposes parameters for user confirmation.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Trip title (e.g. 5-Day Japan Food & Culture Tour)" },
          description: { type: "string", description: "Overview of trip goals" },
          startDate: { type: "string", description: "ISO Date String (YYYY-MM-DD)" },
          endDate: { type: "string", description: "ISO Date String (YYYY-MM-DD)" },
          budgetAmount: { type: "number", description: "Target budget amount" },
          currency: { type: "string", description: "Currency code (default INR)" },
          cityNames: { type: "array", items: { type: "string" }, description: "Initial cities to include" },
        },
        required: ["name", "startDate", "endDate"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    let destinationIds: string[] = [];
    if (args.cityNames && Array.isArray(args.cityNames)) {
      const foundCities = await City.find({ name: { $in: args.cityNames.map((n: string) => new RegExp(`^${n}$`, "i")) } });
      destinationIds = foundCities.map((c) => c._id.toString());
    }

    const tripData: any = {
      userId: userId as any,
      user: userId as any,
      name: args.name,
      description: args.description || "",
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      budget: {
        amount: args.budgetAmount || 0,
        currency: args.currency || "INR",
      },
      destinations: destinationIds,
      status: "UPCOMING",
      visibility: "PRIVATE",
      coverPhoto: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    };

    const newTrip = await Trip.create(tripData);
    return {
      success: true,
      data: newTrip,
      message: `Trip "${newTrip.name}" created successfully!`,
    };
  },
};

export const updateTripTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "update_trip",
      description: "Update existing trip details such as name, dates, or budget.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "ID of trip to update" },
          name: { type: "string" },
          description: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          budgetAmount: { type: "number" },
          currency: { type: "string" },
          status: { type: "string", enum: ["DRAFT", "UPCOMING", "ONGOING", "COMPLETED"] },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) {
      return { success: false, error: "Trip not found or access denied." };
    }

    if (args.name !== undefined) trip.name = args.name;
    if (args.description !== undefined) trip.description = args.description;
    if (args.startDate !== undefined) trip.startDate = new Date(args.startDate);
    if (args.endDate !== undefined) trip.endDate = new Date(args.endDate);
    if (args.status !== undefined) trip.status = args.status;

    if (args.budgetAmount !== undefined) {
      trip.budget = {
        amount: args.budgetAmount,
        currency: args.currency || trip.budget?.currency || "INR",
      };
    }

    await trip.save();
    return {
      success: true,
      data: trip,
      message: `Trip "${trip.name}" updated successfully.`,
    };
  },
};
