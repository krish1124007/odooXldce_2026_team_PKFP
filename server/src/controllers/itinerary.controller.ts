import type { Request, Response } from "express";
import { Trip } from "../models/trip.models.js";
import { TripStop } from "../models/tripStop.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

// Helper: Convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Helper: Detect time overlap between two intervals
const isTimeOverlapping = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
};

// Helper: Format Date to YYYY-MM-DD
const formatDateString = (dateInput: Date | string): string => {
  const d = new Date(dateInput);
  return d.toISOString().split("T")[0] || "";
};

// Helper: Verify trip exists and is owned by current user
const verifyTripOwner = async (tripId: string, userId: string) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw { statusCode: 404, message: "Trip not found" };
  }
  if (trip.userId.toString() !== userId) {
    throw { statusCode: 403, message: "Unauthorized access to this trip" };
  }
  return trip;
};

// ==========================================
// TRIP STOP CONTROLLERS
// ==========================================

// 1. Create Trip Stop
export const createTripStop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const tripId = req.params.tripId as string;
    const { cityId, startDate, endDate, order, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    const trip = await verifyTripOwner(tripId, userId);

    // Validate City
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    const stopStart = new Date(startDate);
    const stopEnd = new Date(endDate);

    if (isNaN(stopStart.getTime()) || isNaN(stopEnd.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid dates provided" });
    }

    if (stopEnd < stopStart) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after start date",
      });
    }

    // Validate stop dates fall within trip dates
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    if (stopStart < tripStart || stopEnd > tripEnd) {
      return res.status(400).json({
        success: false,
        message: `Stop dates (${formatDateString(stopStart)} to ${formatDateString(
          stopEnd
        )}) must fall inside trip date range (${formatDateString(
          tripStart
        )} to ${formatDateString(tripEnd)})`,
      });
    }

    // Check duplicate city stop for MVP
    const existingCityStop = await TripStop.findOne({ tripId, cityId });
    if (existingCityStop) {
      return res.status(400).json({
        success: false,
        message: `${city.name} is already added as a stop in this trip`,
      });
    }

    // Check overlapping stop dates with existing stops
    const existingStops = await TripStop.find({ tripId });
    for (const stop of existingStops) {
      const existingStart = new Date(stop.startDate);
      const existingEnd = new Date(stop.endDate);
      if (stopStart <= existingEnd && stopEnd >= existingStart) {
        const overlapCity = await City.findById(stop.cityId);
        return res.status(400).json({
          success: false,
          message: `Stop dates overlap with existing stop in ${
            overlapCity?.name || "another city"
          } (${formatDateString(existingStart)} to ${formatDateString(existingEnd)})`,
        });
      }
    }

    // Determine default order if not provided
    let stopOrder = order;
    if (stopOrder === undefined || stopOrder === null) {
      const maxOrderStop = await TripStop.findOne({ tripId }).sort({ order: -1 });
      stopOrder = maxOrderStop ? maxOrderStop.order + 1 : 0;
    }

    const newStop = await TripStop.create({
      tripId,
      cityId,
      startDate: stopStart,
      endDate: stopEnd,
      order: stopOrder,
      notes: notes || "",
    });

    // Ensure destination exists in Trip.destinations for Phase 3 compatibility
    if (!trip.destinations.some((id: any) => id.toString() === cityId)) {
      trip.destinations.push(cityId as any);
      await trip.save();
    }

    const populatedStop = await TripStop.findById(newStop._id).populate("cityId");

    res.status(201).json({
      success: true,
      message: "Trip stop created successfully",
      data: populatedStop,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create trip stop",
    });
  }
};

// 2. Get All Trip Stops for a Trip
export const getTripStops = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const tripId = req.params.tripId as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    await verifyTripOwner(tripId, userId);

    const stops = await TripStop.find({ tripId }).sort({ order: 1 }).populate("cityId");

    res.status(200).json({
      success: true,
      data: stops,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch trip stops",
    });
  }
};

// 3. Get Single Trip Stop by ID
export const getTripStopById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }

    const stop = await TripStop.findById(id).populate("cityId");
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    await verifyTripOwner(stop.tripId.toString(), userId);

    res.status(200).json({
      success: true,
      data: stop,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch trip stop",
    });
  }
};

// 4. Update Trip Stop
export const updateTripStop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;
    const { startDate, endDate, notes, order } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }

    const stop = await TripStop.findById(id);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    const trip = await verifyTripOwner(stop.tripId.toString(), userId);

    const newStart = startDate ? new Date(startDate) : stop.startDate;
    const newEnd = endDate ? new Date(endDate) : stop.endDate;

    if (newEnd < newStart) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after start date",
      });
    }

    // Verify trip date boundaries
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    if (newStart < tripStart || newEnd > tripEnd) {
      return res.status(400).json({
        success: false,
        message: `Stop dates must fall inside trip dates (${formatDateString(
          tripStart
        )} to ${formatDateString(tripEnd)})`,
      });
    }

    // Check overlapping stop dates with other stops
    const otherStops = await TripStop.find({
      tripId: stop.tripId,
      _id: { $ne: stop._id },
    });

    for (const other of otherStops) {
      const otherStart = new Date(other.startDate);
      const otherEnd = new Date(other.endDate);
      if (newStart <= otherEnd && newEnd >= otherStart) {
        const overlapCity = await City.findById(other.cityId);
        return res.status(400).json({
          success: false,
          message: `Stop dates overlap with stop in ${
            overlapCity?.name || "another city"
          }`,
        });
      }
    }

    if (startDate) stop.startDate = newStart;
    if (endDate) stop.endDate = newEnd;
    if (notes !== undefined) stop.notes = notes;
    if (order !== undefined) stop.order = order;

    await stop.save();
    const updated = await TripStop.findById(stop._id).populate("cityId");

    res.status(200).json({
      success: true,
      message: "Trip stop updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update trip stop",
    });
  }
};

// 5. Delete Trip Stop (Cascade deletes associated ItineraryActivities)
export const deleteTripStop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }

    const stop = await TripStop.findById(id);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    await verifyTripOwner(stop.tripId.toString(), userId);

    // Cascade delete associated itinerary activities
    await ItineraryActivity.deleteMany({ stopId: stop._id });

    // Delete the trip stop itself
    await TripStop.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Trip stop and associated itinerary activities removed successfully",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete trip stop",
    });
  }
};

// 6. Reorder Trip Stops
export const reorderTripStops = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const tripId = req.params.tripId as string;
    const { stopIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }
    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ success: false, message: "stopIds array is required" });
    }

    await verifyTripOwner(tripId, userId);

    // Verify all stops belong to trip
    const existingStops = await TripStop.find({ tripId });
    if (existingStops.length !== stopIds.length) {
      return res.status(400).json({
        success: false,
        message: "stopIds list length does not match total stops for this trip",
      });
    }

    const existingIds = new Set(existingStops.map((s) => s._id.toString()));
    for (const id of stopIds) {
      if (!existingIds.has(id)) {
        return res.status(400).json({
          success: false,
          message: `Stop ID ${id} does not belong to this trip`,
        });
      }
    }

    // Bulk update orders
    const updatePromises = stopIds.map((id: string, index: number) =>
      TripStop.findByIdAndUpdate(id, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    const reorderedStops = await TripStop.find({ tripId }).sort({ order: 1 }).populate("cityId");

    res.status(200).json({
      success: true,
      message: "Stops reordered successfully",
      data: reorderedStops,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reorder trip stops",
    });
  }
};

// ==========================================
// ITINERARY ACTIVITY CONTROLLERS
// ==========================================

// 7. Add Activity to Stop
export const addItineraryActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const stopId = req.params.stopId as string;
    const { activityId, date, startTime, endTime, order, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!stopId) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }

    const stop = await TripStop.findById(stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    await verifyTripOwner(stop.tripId.toString(), userId);

    // Validate Activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    // Validate Activity belongs to Stop's City
    if (activity.cityId.toString() !== stop.cityId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Activity does not belong to the city of this stop",
      });
    }

    const actDate = new Date(date);
    if (isNaN(actDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid activity date" });
    }

    // Validate Date falls within Stop dates
    const stopStart = new Date(stop.startDate);
    const stopEnd = new Date(stop.endDate);

    const actDateStr = formatDateString(actDate);
    const stopStartStr = formatDateString(stopStart);
    const stopEndStr = formatDateString(stopEnd);

    if (actDateStr < stopStartStr || actDateStr > stopEndStr) {
      return res.status(400).json({
        success: false,
        message: `Activity date (${actDateStr}) must fall within stop date range (${stopStartStr} to ${stopEndStr})`,
      });
    }

    // Validate Start & End Times
    if (!startTime || !endTime || startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be strictly after start time (e.g. 09:00 to 11:00)",
      });
    }

    // Check for Schedule Conflicts on the same date within the trip
    const sameDateActivities = await ItineraryActivity.find({
      tripId: stop.tripId,
      date: actDate,
    }).populate("activityId");

    const conflicts: any[] = [];
    for (const existing of sameDateActivities) {
      if (isTimeOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
        const existingActName = (existing.activityId as any)?.name || "Existing activity";
        conflicts.push({
          activityA: activity.name,
          activityB: existingActName,
          overlapStart: startTime > existing.startTime ? startTime : existing.startTime,
          overlapEnd: endTime < existing.endTime ? endTime : existing.endTime,
          message: `Schedule conflict with '${existingActName}' (${existing.startTime}–${existing.endTime})`,
        });
      }
    }

    // Determine default order
    let actOrder = order;
    if (actOrder === undefined || actOrder === null) {
      const maxOrderAct = await ItineraryActivity.findOne({ stopId, date: actDate }).sort({
        order: -1,
      });
      actOrder = maxOrderAct ? maxOrderAct.order + 1 : 0;
    }

    const newItineraryAct = await ItineraryActivity.create({
      tripId: stop.tripId,
      stopId: stop._id,
      activityId: activity._id,
      date: actDate,
      startTime,
      endTime,
      order: actOrder,
      notes: notes || "",
      estimatedCost: activity.cost || 0,
    });

    const populated = await ItineraryActivity.findById(newItineraryAct._id).populate(
      "activityId"
    );

    res.status(201).json({
      success: true,
      message: conflicts.length > 0 ? "Activity added with schedule conflict warning" : "Activity added to itinerary",
      hasConflict: conflicts.length > 0,
      conflicts,
      data: populated,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add activity to stop",
    });
  }
};

// 8. Get Activities for a Stop
export const getStopActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const stopId = req.params.stopId as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!stopId) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }

    const stop = await TripStop.findById(stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    await verifyTripOwner(stop.tripId.toString(), userId);

    const activities = await ItineraryActivity.find({ stopId })
      .sort({ date: 1, order: 1, startTime: 1 })
      .populate("activityId");

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch stop activities",
    });
  }
};

// 9. Get Single Itinerary Activity by ID
export const getItineraryActivityById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Activity ID is required" });
    }

    const item = await ItineraryActivity.findById(id).populate("activityId");
    if (!item) {
      return res.status(404).json({ success: false, message: "Itinerary activity not found" });
    }

    await verifyTripOwner(item.tripId.toString(), userId);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch itinerary activity",
    });
  }
};

// 10. Update Itinerary Activity
export const updateItineraryActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;
    const { date, startTime, endTime, notes, estimatedCost, order } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Activity ID is required" });
    }

    const item = await ItineraryActivity.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Itinerary activity not found" });
    }

    await verifyTripOwner(item.tripId.toString(), userId);

    const stop = await TripStop.findById(item.stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Associated stop not found" });
    }

    const newDate = date ? new Date(date) : item.date;
    const newStart = startTime || item.startTime;
    const newEnd = endTime || item.endTime;

    if (newEnd <= newStart) {
      return res.status(400).json({
        success: false,
        message: "End time must be strictly after start time",
      });
    }

    // Verify Date within Stop Date range
    const actDateStr = formatDateString(newDate);
    const stopStartStr = formatDateString(stop.startDate);
    const stopEndStr = formatDateString(stop.endDate);

    if (actDateStr < stopStartStr || actDateStr > stopEndStr) {
      return res.status(400).json({
        success: false,
        message: `Date (${actDateStr}) must fall within stop range (${stopStartStr} to ${stopEndStr})`,
      });
    }

    // Conflict Check
    const sameDateActs = await ItineraryActivity.find({
      tripId: item.tripId,
      date: newDate,
      _id: { $ne: item._id },
    }).populate("activityId");

    const conflicts: any[] = [];
    for (const other of sameDateActs) {
      if (isTimeOverlapping(newStart, newEnd, other.startTime, other.endTime)) {
        const otherName = (other.activityId as any)?.name || "Another activity";
        conflicts.push({
          activityA: "Updated Activity",
          activityB: otherName,
          overlapStart: newStart > other.startTime ? newStart : other.startTime,
          overlapEnd: newEnd < other.endTime ? newEnd : other.endTime,
          message: `Conflict with '${otherName}' (${other.startTime}–${other.endTime})`,
        });
      }
    }

    if (date) item.date = newDate;
    if (startTime) item.startTime = newStart;
    if (endTime) item.endTime = newEnd;
    if (notes !== undefined) item.notes = notes;
    if (estimatedCost !== undefined) item.estimatedCost = estimatedCost;
    if (order !== undefined) item.order = order;

    await item.save();

    const updated = await ItineraryActivity.findById(item._id).populate("activityId");

    res.status(200).json({
      success: true,
      message: conflicts.length > 0 ? "Activity updated with conflict warning" : "Activity updated successfully",
      hasConflict: conflicts.length > 0,
      conflicts,
      data: updated,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update itinerary activity",
    });
  }
};

// 11. Delete Itinerary Activity
export const deleteItineraryActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ success: false, message: "Activity ID is required" });
    }

    const item = await ItineraryActivity.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Itinerary activity not found" });
    }

    await verifyTripOwner(item.tripId.toString(), userId);

    await ItineraryActivity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Itinerary activity removed successfully",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete itinerary activity",
    });
  }
};

// 12. Reorder Activities for a Stop
export const reorderStopActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const stopId = req.params.stopId as string;
    const { activityIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!stopId) {
      return res.status(400).json({ success: false, message: "Stop ID is required" });
    }
    if (!Array.isArray(activityIds)) {
      return res.status(400).json({ success: false, message: "activityIds array is required" });
    }

    const stop = await TripStop.findById(stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Trip stop not found" });
    }

    await verifyTripOwner(stop.tripId.toString(), userId);

    const existingActs = await ItineraryActivity.find({ stopId });
    if (existingActs.length !== activityIds.length) {
      return res.status(400).json({
        success: false,
        message: "activityIds list length does not match activities for this stop",
      });
    }

    const updatePromises = activityIds.map((id: string, idx: number) =>
      ItineraryActivity.findByIdAndUpdate(id, { order: idx }, { new: true })
    );

    await Promise.all(updatePromises);

    const reordered = await ItineraryActivity.find({ stopId })
      .sort({ order: 1 })
      .populate("activityId");

    res.status(200).json({
      success: true,
      message: "Activities reordered successfully",
      data: reordered,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reorder activities",
    });
  }
};

// ==========================================
// 13. GET COMPLETE STRUCTURED ITINERARY
// ==========================================
export const getCompleteItinerary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.userId;
    const tripId = req.params.tripId as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    const trip = await Trip.findById(tripId).populate("destinations");
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this trip" });
    }

    // Fetch Stops sorted by order
    const stops = await TripStop.find({ tripId }).sort({ order: 1 }).populate("cityId");

    // Fetch all Itinerary Activities for this trip sorted by date, order, startTime
    const allActivities = await ItineraryActivity.find({ tripId })
      .sort({ date: 1, order: 1, startTime: 1 })
      .populate("activityId");

    // Build structured output
    const structuredStops = stops.map((stop) => {
      const stopActs = allActivities.filter(
        (act) => act.stopId.toString() === stop._id.toString()
      );

      return {
        stop,
        city: stop.cityId,
        activities: stopActs.map((act) => ({
          itineraryActivity: act,
          activity: act.activityId,
        })),
      };
    });

    // Detect overall trip schedule conflicts across all activities
    const conflicts: any[] = [];
    for (let i = 0; i < allActivities.length; i++) {
      for (let j = i + 1; j < allActivities.length; j++) {
        const actA = allActivities[i];
        const actB = allActivities[j];

        if (actA && actB && formatDateString(actA.date) === formatDateString(actB.date)) {
          if (isTimeOverlapping(actA.startTime, actA.endTime, actB.startTime, actB.endTime)) {
            const nameA = (actA.activityId as any)?.name || "Activity A";
            const nameB = (actB.activityId as any)?.name || "Activity B";
            conflicts.push({
              activityAId: actA._id,
              activityBId: actB._id,
              nameA,
              nameB,
              date: formatDateString(actA.date),
              startTimeA: actA.startTime,
              endTimeA: actA.endTime,
              startTimeB: actB.startTime,
              endTimeB: actB.endTime,
              message: `Overlapping schedule between '${nameA}' (${actA.startTime}–${actA.endTime}) and '${nameB}' (${actB.startTime}–${actB.endTime}) on ${formatDateString(
                actA.date
              )}`,
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        trip,
        stops: structuredStops,
        hasConflicts: conflicts.length > 0,
        conflicts,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch complete itinerary",
    });
  }
};
