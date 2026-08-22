import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// Routers
import authRoutes from "./routers/authRoutes.js";
import tripRoutes from "./routers/tripRoutes.js";
import cityRoutes from "./routers/cityRoutes.js";
import activityRoutes from "./routers/activityRoutes.js";
import itineraryRoutes from "./routers/itineraryRoutes.js";
import budgetRoutes from "./routers/budgetRoutes.js";
import publicRoutes from "./routers/publicRoutes.js";
import agentRoutes from "./routers/agentRoutes.js";
import adminRouter from "./routers/admin.routes.js";
import userRouter from "./routers/user.routes.js";

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return callback(null, origin);
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 1. Health Check Endpoint (Phase 1 & Phase 7 Requirement)
app.get("/api/health", (req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        success: isDbConnected,
        status: isDbConnected ? "healthy" : "degraded",
        database: isDbConnected ? "connected" : "disconnected",
        message: "GlobeTrotter API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// 2. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRouter);
app.use("/api/trips", tripRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/stops", itineraryRoutes);
app.use("/api/itinerary-activities", itineraryRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/agent", agentRoutes);

// 3. Unknown Route Handler (404)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route '${req.originalUrl}' not found on GlobeTrotter server.`
    });
});

// 4. Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

export { app };
