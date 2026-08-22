import { User } from "../models/user.models.js";
import { Trip } from "../models/trip.models.js";

export interface AgentContext {
  page?: string;
  tripId?: string;
  cityId?: string;
  conversationId?: string;
}

export const buildAgentContext = async (userId: string, context?: AgentContext) => {
  const user = await User.findById(userId).select("firstName travelStyle interests travelPace language savedDestinations");

  const contextData: any = {
    user: {
      firstName: user?.firstName || "Traveler",
      travelStyle: user?.travelStyle || "Balanced",
      interests: user?.interests || [],
      travelPace: user?.travelPace || "Moderate",
      language: user?.language || "English",
      savedDestinationsCount: user?.savedDestinations?.length || 0,
    },
    pageContext: context?.page || "dashboard",
  };

  if (context?.tripId) {
    const trip = await Trip.findOne({ _id: context.tripId, user: userId })
      .select("name startDate endDate budget status destinations")
      .populate("destinations", "name country");

    if (trip) {
      contextData.activeTrip = {
        id: trip._id.toString(),
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        status: trip.status,
        destinations: trip.destinations,
      };
    }
  }

  if (context?.cityId) {
    contextData.activeCityId = context.cityId;
  }

  return contextData;
};
