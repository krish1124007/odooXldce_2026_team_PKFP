import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`[GlobeTrotter API] Server is running on port ${PORT}`);
        console.log(`[GlobeTrotter API] Health Check: http://localhost:${PORT}/api/health`);
    });
}).catch((err) => {
    console.error("[GlobeTrotter API Error] Failed to start server:", err);
});
