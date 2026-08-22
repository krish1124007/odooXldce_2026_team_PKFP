import { Router } from "express";
import { createAdmin, loginAdmin } from "../controllers/admin/admin.auth.controller.js";
import {
  getOverview,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getTripAnalytics,
  getAnalytics,
  getAIAnalytics,
} from "../controllers/admin/admin.analytics.controller.js";
import { verifyUser, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Admin Auth Routes
router.route("/register").post(createAdmin);
router.route("/login").post(loginAdmin);

// Protected Admin Analytics & Management Routes
router.use(verifyUser, verifyAdmin);

router.get("/overview", getOverview);
router.get("/users", getUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/role", updateUserRole);
router.get("/trips", getTripAnalytics);
router.get("/analytics", getAnalytics);
router.get("/ai-analytics", getAIAnalytics);

export default router;
