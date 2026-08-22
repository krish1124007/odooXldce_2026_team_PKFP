import { User } from "../models/user.models.js";

export const getUserPreferencesTool = {
  definition: {
    type: "function",
    function: {
      name: "get_user_preferences",
      description: "Retrieve the authenticated user's travel preferences (travelStyle, interests, travelPace, language, savedDestinations).",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  handler: async (_args: any, userId: string) => {
    const user = await User.findById(userId).select("firstName lastName travelStyle interests travelPace language savedDestinations");
    if (!user) {
      return { success: false, error: "User not found." };
    }
    return {
      success: true,
      data: {
        travelStyle: user.travelStyle || "Balanced",
        interests: user.interests || [],
        travelPace: user.travelPace || "Moderate",
        language: user.language || "English",
        savedDestinations: user.savedDestinations || [],
      },
    };
  },
};
