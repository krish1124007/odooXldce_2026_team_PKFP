import { Router } from "express";
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripDestination,
  removeTripDestination,
  getTripDestinations,
  addTripActivity,
  removeTripActivity,
  getTripActivities,
} from "../controllers/trip.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyUser);

router.post("/", createTrip);
router.get("/", getMyTrips);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

// Trip Destination Sub-resource endpoints
router.get("/:tripId/destinations", getTripDestinations);
router.post("/:tripId/destinations/:cityId", addTripDestination);
router.delete("/:tripId/destinations/:cityId", removeTripDestination);

// Trip Activity Sub-resource endpoints
router.get("/:tripId/activities", getTripActivities);
router.post("/:tripId/activities/:activityId", addTripActivity);
router.delete("/:tripId/activities/:activityId", removeTripActivity);

export default router;
