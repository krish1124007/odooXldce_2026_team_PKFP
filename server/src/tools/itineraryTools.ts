import { Trip } from "../models/trip.models.js";
import { TripStop } from "../models/tripStop.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

// Helper: Convert "HH:MM" to total minutes from midnight
const timeToMinutes = (tStr?: string): number => {
  if (!tStr) return 0;
  const parts = tStr.split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  return h * 60 + m;
};

// READ: get_itinerary
export const getItineraryTool = {
  definition: {
    type: "function",
    function: {
      name: "get_itinerary",
      description: "Retrieve full stop breakdown and scheduled activities for a trip owned by user.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "MongoDB ID of the trip" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) {
      return { success: false, error: "Trip not found or access denied." };
    }

    const stops = await TripStop.find({ tripId: args.tripId }).populate("cityId", "name country region image").sort({ order: 1, startDate: 1 });
    const scheduledActivities = await ItineraryActivity.find({ tripId: args.tripId })
      .populate("activityId", "name type cost durationMinutes image")
      .populate({ path: "stopId", populate: { path: "cityId", select: "name" } })
      .sort({ date: 1, order: 1 });

    return {
      success: true,
      data: {
        tripId: trip._id.toString(),
        tripName: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        stops: stops.map((s: any) => ({
          id: s._id.toString(),
          cityId: s.cityId?._id?.toString() || s.cityId?.toString(),
          cityName: s.cityId?.name || "City",
          startDate: s.startDate,
          endDate: s.endDate,
          order: s.order,
          notes: s.notes,
        })),
        scheduledActivities: scheduledActivities.map((a: any) => ({
          id: a._id.toString(),
          stopId: a.stopId?._id?.toString() || a.stopId?.toString(),
          cityName: a.stopId?.cityId?.name || "City",
          activityId: a.activityId?._id?.toString() || a.activityId?.toString(),
          activityName: a.activityId?.name || "Activity",
          type: a.activityId?.type || "General",
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
          estimatedCost: a.estimatedCost,
          notes: a.notes,
        })),
      },
    };
  },
};

// READ: detect_schedule_conflicts
export const detectScheduleConflictsTool = {
  definition: {
    type: "function",
    function: {
      name: "detect_schedule_conflicts",
      description: "Detect overlapping times, tight transitions, or schedule bottlenecks across scheduled itinerary activities.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string", description: "MongoDB ID of the trip" },
        },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) {
      return { success: false, error: "Trip not found or access denied." };
    }

    const scheduled = await ItineraryActivity.find({ tripId: args.tripId })
      .populate("activityId", "name durationMinutes")
      .sort({ date: 1, startTime: 1 });

    const conflicts: any[] = [];
    const groupedByDay: Record<string, any[]> = {};

    scheduled.forEach((act: any) => {
      const dStr = new Date(act.date).toISOString().split("T")[0] || "unknown-date";
      if (!groupedByDay[dStr]) groupedByDay[dStr] = [];
      groupedByDay[dStr].push(act);
    });

    Object.entries(groupedByDay).forEach(([dayStr, acts]) => {
      for (let i = 0; i < acts.length; i++) {
        for (let j = i + 1; j < acts.length; j++) {
          const a1 = acts[i];
          const a2 = acts[j];

          const start1 = timeToMinutes(a1.startTime);
          const end1 = timeToMinutes(a1.endTime);
          const start2 = timeToMinutes(a2.startTime);
          const end2 = timeToMinutes(a2.endTime);

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              date: dayStr,
              type: "OVERLAP",
              activity1: { id: a1._id.toString(), name: a1.activityId?.name || "Activity 1", time: `${a1.startTime}-${a1.endTime}` },
              activity2: { id: a2._id.toString(), name: a2.activityId?.name || "Activity 2", time: `${a2.startTime}-${a2.endTime}` },
              suggestion: "Adjust startTime/endTime or move one activity to another day.",
            });
          }
        }
      }
    });

    return {
      success: true,
      hasConflicts: conflicts.length > 0,
      conflictsCount: conflicts.length,
      conflicts,
    };
  },
};

// READ: get_trip_stops
export const getTripStopsTool = {
  definition: {
    type: "function",
    function: {
      name: "get_trip_stops",
      description: "Retrieve list of city stops for a trip.",
      parameters: {
        type: "object",
        properties: { tripId: { type: "string" } },
        required: ["tripId"],
      },
    },
  },
  handler: async (args: { tripId: string }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const stops = await TripStop.find({ tripId: args.tripId }).populate("cityId", "name country region").sort({ order: 1 });
    return { success: true, data: stops };
  },
};

// READ: get_stop_activities
export const getStopActivitiesTool = {
  definition: {
    type: "function",
    function: {
      name: "get_stop_activities",
      description: "Retrieve activities scheduled for a specific trip stop.",
      parameters: {
        type: "object",
        properties: { stopId: { type: "string" } },
        required: ["stopId"],
      },
    },
  },
  handler: async (args: { stopId: string }, userId: string) => {
    const stop = await TripStop.findById(args.stopId);
    if (!stop) return { success: false, error: "Stop not found." };
    const trip = await Trip.findOne({ _id: stop.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Access denied." };

    const activities = await ItineraryActivity.find({ stopId: args.stopId }).populate("activityId", "name type cost durationMinutes").sort({ date: 1, startTime: 1 });
    return { success: true, data: activities };
  },
};

// WRITE: add_stop
export const addStopTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "add_stop",
      description: "Add a city stop to an itinerary.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string" },
          cityName: { type: "string", description: "Name of city to add" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          notes: { type: "string" },
        },
        required: ["tripId", "cityName", "startDate", "endDate"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    const city = await City.findOne({ name: { $regex: `^${args.cityName}$`, $options: "i" } });
    if (!city) return { success: false, error: `City "${args.cityName}" not found in database.` };

    const existingStops = await TripStop.find({ tripId: args.tripId });
    const maxOrder = existingStops.reduce((max, s) => Math.max(max, s.order || 0), 0);

    const newStop = await TripStop.create({
      tripId: args.tripId,
      cityId: city._id,
      startDate: new Date(args.startDate),
      endDate: new Date(args.endDate),
      order: maxOrder + 1,
      notes: args.notes || "",
    });

    if (!trip.destinations.includes(city._id as any)) {
      trip.destinations.push(city._id as any);
      await trip.save();
    }

    return { success: true, data: newStop, message: `Added ${city.name} stop to trip.` };
  },
};

// WRITE: update_stop
export const updateStopTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "update_stop",
      description: "Update dates or notes for a trip stop.",
      parameters: {
        type: "object",
        properties: {
          stopId: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          notes: { type: "string" },
        },
        required: ["stopId"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    const stop = await TripStop.findById(args.stopId);
    if (!stop) return { success: false, error: "Stop not found." };
    const trip = await Trip.findOne({ _id: stop.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Access denied." };

    if (args.startDate) stop.startDate = new Date(args.startDate);
    if (args.endDate) stop.endDate = new Date(args.endDate);
    if (args.notes !== undefined) stop.notes = args.notes;

    await stop.save();
    return { success: true, data: stop, message: "Stop updated successfully." };
  },
};

// WRITE: remove_stop
export const removeStopTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "remove_stop",
      description: "Remove a city stop and its scheduled activities from an itinerary.",
      parameters: {
        type: "object",
        properties: { stopId: { type: "string" } },
        required: ["stopId"],
      },
    },
  },
  handler: async (args: { stopId: string }, userId: string) => {
    const stop = await TripStop.findById(args.stopId);
    if (!stop) return { success: false, error: "Stop not found." };
    const trip = await Trip.findOne({ _id: stop.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Access denied." };

    await ItineraryActivity.deleteMany({ stopId: args.stopId });
    await TripStop.findByIdAndDelete(args.stopId);
    return { success: true, message: "Stop and its activities removed from itinerary." };
  },
};

// WRITE: reorder_stops
export const reorderStopsTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "reorder_stops",
      description: "Reorder trip stops sequence.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string" },
          stopIdsInOrder: { type: "array", items: { type: "string" } },
        },
        required: ["tripId", "stopIdsInOrder"],
      },
    },
  },
  handler: async (args: { tripId: string; stopIdsInOrder: string[] }, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    for (let i = 0; i < args.stopIdsInOrder.length; i++) {
      await TripStop.updateOne({ _id: args.stopIdsInOrder[i] as any, tripId: args.tripId as any }, { order: i + 1 });
    }
    return { success: true, message: "Trip stops reordered successfully." };
  },
};

// WRITE: add_activity_to_itinerary
export const addActivityToItineraryTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "add_activity_to_itinerary",
      description: "Schedule an activity on a specific date and time slot within a trip stop.",
      parameters: {
        type: "object",
        properties: {
          tripId: { type: "string" },
          stopId: { type: "string" },
          activityId: { type: "string" },
          activityName: { type: "string", description: "Optional name if activityId not known" },
          date: { type: "string", description: "ISO Date YYYY-MM-DD" },
          startTime: { type: "string", description: "HH:MM (e.g. 10:00)" },
          endTime: { type: "string", description: "HH:MM (e.g. 12:00)" },
          notes: { type: "string" },
        },
        required: ["tripId", "stopId", "date", "startTime", "endTime"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    const trip = await Trip.findOne({ _id: args.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Trip not found or access denied." };

    let targetActivityId = args.activityId;
    let activityObj = null;

    if (targetActivityId) {
      activityObj = await Activity.findById(targetActivityId);
    } else if (args.activityName) {
      activityObj = await Activity.findOne({ name: { $regex: args.activityName, $options: "i" } });
      if (activityObj) targetActivityId = activityObj._id.toString();
    }

    if (!activityObj) {
      return { success: false, error: "Activity not found in database." };
    }

    const newItineraryAct = await ItineraryActivity.create({
      tripId: args.tripId,
      stopId: args.stopId,
      activityId: activityObj._id,
      date: new Date(args.date),
      startTime: args.startTime,
      endTime: args.endTime,
      notes: args.notes || "",
      estimatedCost: activityObj.cost || 0,
      order: 1,
    });

    if (!trip.activities.includes(activityObj._id as any)) {
      trip.activities.push(activityObj._id as any);
      await trip.save();
    }

    return { success: true, data: newItineraryAct, message: `Scheduled "${activityObj.name}" for ${args.date} at ${args.startTime}.` };
  },
};

// WRITE: update_itinerary_activity
export const updateItineraryActivityTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "update_itinerary_activity",
      description: "Update date, timeslot, or notes for a scheduled itinerary activity.",
      parameters: {
        type: "object",
        properties: {
          itineraryActivityId: { type: "string" },
          date: { type: "string" },
          startTime: { type: "string" },
          endTime: { type: "string" },
          notes: { type: "string" },
        },
        required: ["itineraryActivityId"],
      },
    },
  },
  handler: async (args: any, userId: string) => {
    const item = await ItineraryActivity.findById(args.itineraryActivityId);
    if (!item) return { success: false, error: "Itinerary activity not found." };
    const trip = await Trip.findOne({ _id: item.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Access denied." };

    if (args.date) item.date = new Date(args.date);
    if (args.startTime) item.startTime = args.startTime;
    if (args.endTime) item.endTime = args.endTime;
    if (args.notes !== undefined) item.notes = args.notes;

    await item.save();
    return { success: true, data: item, message: "Itinerary activity updated." };
  },
};

// WRITE: remove_itinerary_activity
export const removeItineraryActivityTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "remove_itinerary_activity",
      description: "Remove an activity from a scheduled itinerary slot.",
      parameters: {
        type: "object",
        properties: { itineraryActivityId: { type: "string" } },
        required: ["itineraryActivityId"],
      },
    },
  },
  handler: async (args: { itineraryActivityId: string }, userId: string) => {
    const item = await ItineraryActivity.findById(args.itineraryActivityId);
    if (!item) return { success: false, error: "Itinerary activity not found." };
    const trip = await Trip.findOne({ _id: item.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
    if (!trip) return { success: false, error: "Access denied." };

    await ItineraryActivity.findByIdAndDelete(args.itineraryActivityId);
    return { success: true, message: "Activity removed from itinerary schedule." };
  },
};

// WRITE: reorder_itinerary_activities
export const reorderItineraryActivitiesTool = {
  isWrite: true,
  definition: {
    type: "function",
    function: {
      name: "reorder_itinerary_activities",
      description: "Reorder scheduled activities for a specific day/stop.",
      parameters: {
        type: "object",
        properties: {
          activityIdsInOrder: { type: "array", items: { type: "string" } },
        },
        required: ["activityIdsInOrder"],
      },
    },
  },
  handler: async (args: { activityIdsInOrder: string[] }, userId: string) => {
    for (let i = 0; i < args.activityIdsInOrder.length; i++) {
      const actId = args.activityIdsInOrder[i];
      const item = await ItineraryActivity.findById(actId);
      if (item) {
        const trip = await Trip.findOne({ _id: item.tripId, $or: [{ userId: userId as any }, { user: userId as any }] });
        if (trip) {
          item.order = i + 1;
          await item.save();
        }
      }
    }
    return { success: true, message: "Activities reordered." };
  },
};
