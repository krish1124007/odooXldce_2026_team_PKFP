import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 1. Health Check Endpoint (Phase 1 Requirement)
app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
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
