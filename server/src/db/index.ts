import mongoose from "mongoose";

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/globetrotter";
    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000 // Fast timeout if MongoDB is offline
        });
        console.log(`[GlobeTrotter DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error: any) {
        console.warn(`[GlobeTrotter DB Notice] Local MongoDB offline or unreachable: ${error.message}`);
        console.log("[GlobeTrotter DB Notice] Backend starting in fallback mode for Phase 1 development.");
    }
}

export { connectDB };
