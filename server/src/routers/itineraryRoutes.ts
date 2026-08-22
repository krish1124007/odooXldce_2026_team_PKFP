import { Router } from "express";
import {
  createTripStop,
  getTripStops,
  getTripStopById,
  updateTripStop,
  deleteTripStop,
  reorderTripStops,
  addItineraryActivity,
  getStopActivities,
  getItineraryActivityById,
  updateItineraryActivity,
  deleteItineraryActivity,
  reorderStopActivities,
  getCompleteItinerary,
} from "../controllers/itinerary.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyUser);

// Complete Itinerary Endpoint
router.get("/trips/:tripId", getCompleteItinerary);
router.get("/trips/:tripId/itinerary", getCompleteItinerary);

// Trip Stop Endpoints
router.post("/trips/:tripId/stops", createTripStop);
router.get("/trips/:tripId/stops", getTripStops);
router.put("/trips/:tripId/stops/reorder", reorderTripStops);
router.get("/stops/:id", getTripStopById);
router.put("/stops/:id", updateTripStop);
router.delete("/stops/:id", deleteTripStop);

// Itinerary Activity Endpoints
router.post("/stops/:stopId/activities", addItineraryActivity);
router.get("/stops/:stopId/activities", getStopActivities);
router.put("/stops/:stopId/activities/reorder", reorderStopActivities);
router.get("/itinerary-activities/:id", getItineraryActivityById);
router.put("/itinerary-activities/:id", updateItineraryActivity);
router.delete("/itinerary-activities/:id", deleteItineraryActivity);

export default router;
