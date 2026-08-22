import { Router } from "express";
import {
  getPublicTrips,
  getPublicTripByPublicId,
  copyPublicTrip,
} from "../controllers/publicTrip.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Community Trip Discovery
router.get("/trips", getPublicTrips);

// Public Trip View (No auth required)
router.get("/trips/:publicId", getPublicTripByPublicId);

// Copy Public Trip (Auth required)
router.post("/trips/:publicId/copy", verifyUser, copyPublicTrip);

export default router;

