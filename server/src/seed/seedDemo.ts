import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/user.models.js";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";
import { Trip } from "../models/trip.models.js";
import { TripStop } from "../models/tripStop.models.js";
import { ItineraryActivity } from "../models/itineraryActivity.models.js";
import { Expense } from "../models/expense.models.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/globetrotter";

// Standard Demo Password for Development
const DEMO_PASSWORD = "Demo@12345";

// Demo Accounts Definition
const DEMO_USERS_DATA = [
  {
    email: "demo@globetrotter.dev",
    firstName: "Alex",
    lastName: "Traveler",
    role: "USER" as const,
    travelStyle: "Balanced",
    travelPace: "Moderate",
    language: "English",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    interests: ["Culture", "Food", "Photography", "Sightseeing"],
  },
  {
    email: "busy@globetrotter.dev",
    firstName: "Maya",
    lastName: "Explorer",
    role: "USER" as const,
    travelStyle: "Luxury",
    travelPace: "Fast-Paced",
    language: "English",
    profilePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    interests: ["Adventure", "Shopping", "Entertainment", "Gastronomy"],
  },
  {
    email: "empty@globetrotter.dev",
    firstName: "New",
    lastName: "Traveler",
    role: "USER" as const,
    travelStyle: "Budget",
    travelPace: "Relaxed",
    language: "English",
    profilePhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    interests: ["Nature", "Relaxation"],
  },
  {
    email: "budget@globetrotter.dev",
    firstName: "Budget",
    lastName: "Traveler",
    role: "USER" as const,
    travelStyle: "Backpacker",
    travelPace: "Balanced",
    language: "English",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    interests: ["Hostels", "Street Food", "Free Tours"],
  },
  {
    email: "creator@globetrotter.dev",
    firstName: "Travel",
    lastName: "Creator",
    role: "USER" as const,
    travelStyle: "Cultural",
    travelPace: "In-Depth",
    language: "English",
    profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    interests: ["Photography", "Public Itineraries", "Vlogging", "Guides"],
  },
];

// Helper to calculate relative date offset from today
const getRelativeDate = (daysOffset: number, hoursOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
  return date;
};

// Seed Script Function
export const seedDemoData = async () => {
  try {
    console.log("==================================================");
    console.log("  GLOBALTROTTER DEMO SEED SYSTEM");
    console.log("==================================================");
    console.log("Connecting to MongoDB:", mongoUri);

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.\n");

    // 1. Ensure Cities exist in DB
    const existingCitiesCount = await City.countDocuments();
    if (existingCitiesCount === 0) {
      console.log("No cities found. Please run 'npm run seed' first to seed global cities.");
    }

    const cities = await City.find({});
    const cityMap: Record<string, any> = {};
    cities.forEach((c) => {
      cityMap[c.name.toLowerCase()] = c;
    });

    const getCityId = (cityName: string): any => {
      const match = cityMap[cityName.toLowerCase()];
      return match ? match._id : (cities[0]?._id || null);
    };

    // Fetch existing activities or map by city
    const allActivities = await Activity.find({});
    const activitiesByCity: Record<string, any[]> = {};
    allActivities.forEach((act) => {
      const cId = act.cityId.toString();
      if (!activitiesByCity[cId]) activitiesByCity[cId] = [];
      activitiesByCity[cId].push(act);
    });

    // 2. Clean up existing demo records idempotently
    const demoEmails = DEMO_USERS_DATA.map((u) => u.email);
    const existingDemoUsers: any[] = await User.find({ email: { $in: demoEmails } as any });
    const existingDemoUserIds = existingDemoUsers.map((u) => u._id);

    if (existingDemoUserIds.length > 0) {
      const existingDemoTrips: any[] = await Trip.find({ userId: { $in: existingDemoUserIds } as any });
      const existingDemoTripIds = existingDemoTrips.map((t) => t._id);

      if (existingDemoTripIds.length > 0) {
        await Expense.deleteMany({ tripId: { $in: existingDemoTripIds } as any });
        await ItineraryActivity.deleteMany({ tripId: { $in: existingDemoTripIds } as any });
        await TripStop.deleteMany({ tripId: { $in: existingDemoTripIds } as any });
        await Trip.deleteMany({ _id: { $in: existingDemoTripIds } as any });
      }
      await User.deleteMany({ _id: { $in: existingDemoUserIds } as any });
      console.log(`Cleaned up previous demo data for ${existingDemoUsers.length} demo users.`);
    }

    // 3. Hash Password once for demo accounts
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // 4. Create Demo Users
    const createdUsersMap: Record<string, any> = {};
    for (const userData of DEMO_USERS_DATA) {
      const user = await User.create({
        ...userData,
        passwordHash: hashedPassword,
        savedDestinations: [
          { destinationId: getCityId("Tokyo")?.toString(), name: "Tokyo", country: "Japan" },
          { destinationId: getCityId("Paris")?.toString(), name: "Paris", country: "France" },
        ],
      });
      createdUsersMap[userData.email] = user;
    }
    console.log(`Created ${Object.keys(createdUsersMap).length} demo user accounts with password '${DEMO_PASSWORD}'.`);

    // Counter stats
    let totalTripsCount = 0;
    let totalStopsCount = 0;
    let totalItineraryActivitiesCount = 0;
    let totalExpensesCount = 0;
    let totalPublicItinerariesCount = 0;

    // Helper to build a complete Trip with Stops, Activities, and Expenses
    const buildDemoTrip = async (params: {
      userId: any;
      name: string;
      description?: string;
      coverPhoto?: string;
      startDaysOffset: number;
      durationDays: number;
      status: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED";
      visibility?: "PRIVATE" | "PUBLIC";
      publicId?: string;
      plannedBudget: number;
      cityNames: string[];
      addOverBudgetExpenses?: boolean;
      customActivitiesPerDay?: number;
    }) => {
      const startDate = getRelativeDate(params.startDaysOffset);
      const endDate = getRelativeDate(params.startDaysOffset + params.durationDays);

      const cityIds = params.cityNames.map((cName) => getCityId(cName)).filter(Boolean);

      const tripPayload: any = {
        userId: params.userId,
        name: params.name,
        description: params.description || `Explore ${params.cityNames.join(", ")} with a customized GlobeTrotter itinerary.`,
        coverPhoto: params.coverPhoto || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
        startDate,
        endDate,
        status: params.status,
        visibility: params.visibility || "PRIVATE",
        budget: {
          amount: params.plannedBudget,
          currency: "INR",
        },
        destinations: cityIds,
      };

      if (params.publicId) {
        tripPayload.publicId = params.publicId;
      }

      const trip: any = await Trip.create(tripPayload);
      totalTripsCount++;
      if (params.visibility === "PUBLIC") totalPublicItinerariesCount++;

      // Create TripStops
      const daysPerStop = Math.max(1, Math.floor(params.durationDays / cityIds.length));
      const createdStops: any[] = [];

      for (let i = 0; i < cityIds.length; i++) {
        const stopStartDate = getRelativeDate(params.startDaysOffset + i * daysPerStop);
        const stopEndDate = getRelativeDate(params.startDaysOffset + (i + 1) * daysPerStop);

        const stop: any = await TripStop.create({
          tripId: trip._id as any,
          cityId: cityIds[i] as any,
          startDate: stopStartDate,
          endDate: stopEndDate,
          order: i + 1,
          notes: `Explore local attractions and food spots in ${params.cityNames[i]}.`,
        });
        createdStops.push(stop);
        totalStopsCount++;
      }

      // Create ItineraryActivities & Expenses
      let totalEstCost = 0;

      for (let sIdx = 0; sIdx < createdStops.length; sIdx++) {
        const stop = createdStops[sIdx];
        const cityIdStr = stop.cityId.toString();
        const availableActs = activitiesByCity[cityIdStr] || allActivities.slice(0, 3);

        const actsCount = params.customActivitiesPerDay || 3;

        for (let aIdx = 0; aIdx < Math.min(actsCount, availableActs.length); aIdx++) {
          const act = availableActs[aIdx];
          const actDate = getRelativeDate(params.startDaysOffset + sIdx * daysPerStop);
          const startHour = 9 + aIdx * 3;
          const endHour = startHour + 2;

          const startTimeStr = `${startHour.toString().padStart(2, "0")}:00`;
          const endTimeStr = `${endHour.toString().padStart(2, "0")}:00`;
          const estCost = act.cost || (aIdx === 0 ? 0 : 1500);

          totalEstCost += estCost;

          const itineraryAct: any = await ItineraryActivity.create({
            tripId: trip._id as any,
            stopId: stop._id as any,
            activityId: act._id as any,
            date: actDate,
            startTime: startTimeStr,
            endTime: endTimeStr,
            order: aIdx + 1,
            notes: `Enjoy ${act.name} at ${params.cityNames[sIdx]}`,
            estimatedCost: estCost,
          });
          totalItineraryActivitiesCount++;

          // Log corresponding expense
          await Expense.create({
            tripId: trip._id as any,
            stopId: stop._id as any,
            itineraryActivityId: itineraryAct._id as any,
            category: act.type === "Food" ? "MEAL" : act.type === "Culture" ? "ACTIVITY" : "TRANSPORT",
            description: `${act.name} Ticket / Entry`,
            amount: estCost,
            currency: "INR",
            date: actDate,
            type: "ESTIMATED",
          });
          totalExpensesCount++;
        }
      }

      // Log actual hotel & transport expenses
      await Expense.create({
        tripId: trip._id as any,
        stopId: (createdStops[0]?._id as any),
        category: "STAY",
        description: "Hotel / Accommodation Booking",
        amount: params.addOverBudgetExpenses ? params.plannedBudget * 0.7 : params.plannedBudget * 0.4,
        currency: "INR",
        date: startDate,
        type: "ACTUAL",
      });
      totalExpensesCount++;

      await Expense.create({
        tripId: trip._id as any,
        stopId: (createdStops[0]?._id as any),
        category: "TRANSPORT",
        description: "Shinkansen / Rail Pass & Transfers",
        amount: params.addOverBudgetExpenses ? params.plannedBudget * 0.5 : params.plannedBudget * 0.25,
        currency: "INR",
        date: startDate,
        type: "ACTUAL",
      });
      totalExpensesCount++;

      return trip;
    };

    // ==================================================
    // SEED TRIPS FOR USER 1 — Alex Traveler (demo@globetrotter.dev)
    // ==================================================
    const userAlex = createdUsersMap["demo@globetrotter.dev"];

    // 1. Ongoing Trip (Japan Adventure)
    await buildDemoTrip({
      userId: userAlex._id,
      name: "Japan Adventure",
      description: "A 7-day multi-city journey across Tokyo, Kyoto, and Osaka blending modern culture and ancient temples.",
      coverPhoto: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
      startDaysOffset: -3, // Started 3 days ago
      durationDays: 7,     // Ends in 4 days
      status: "ONGOING",
      plannedBudget: 100000,
      cityNames: ["Tokyo", "Kyoto", "Osaka"],
    });

    // 2. Upcoming Trip (European Summer Escape)
    await buildDemoTrip({
      userId: userAlex._id,
      name: "European Summer Escape",
      description: "Exploring romantic avenues, museums, and historical landmarks across Paris, Amsterdam, and Rome.",
      coverPhoto: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
      startDaysOffset: 12, // Starts in 12 days
      durationDays: 10,
      status: "UPCOMING",
      visibility: "PUBLIC",
      publicId: "pub-euro-summer-escape",
      plannedBudget: 150000,
      cityNames: ["Paris", "Amsterdam", "Rome"],
    });

    // 3. Completed Trip (NYC Getaway)
    await buildDemoTrip({
      userId: userAlex._id,
      name: "NYC Getaway",
      description: "Broadway shows, Central Park strolls, and world-class museums in New York City.",
      coverPhoto: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80",
      startDaysOffset: -35, // 35 days ago
      durationDays: 5,
      status: "COMPLETED",
      plannedBudget: 85000,
      cityNames: ["New York City"],
    });

    // 4. Draft Trip (Kerala Weekend)
    await buildDemoTrip({
      userId: userAlex._id,
      name: "Kerala Weekend Retreat",
      description: "Peaceful backwater cruise and tea plantation walks.",
      coverPhoto: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
      startDaysOffset: 25,
      durationDays: 4,
      status: "DRAFT",
      plannedBudget: 35000,
      cityNames: ["Bali"],
    });

    // ==================================================
    // SEED TRIPS FOR USER 2 — Maya Explorer (busy@globetrotter.dev)
    // 10-15 Trips for Crowded UI Testing
    // ==================================================
    const userMaya = createdUsersMap["busy@globetrotter.dev"];

    const busyTripConfigs = [
      { name: "Himalayan Expedition & Trek", offset: -2, duration: 8, status: "ONGOING" as const, cities: ["Tokyo", "Kyoto"], budget: 90000 },
      { name: "Dubai Luxury & Desert Safari", offset: 5, duration: 5, status: "UPCOMING" as const, cities: ["Dubai"], budget: 120000 },
      { name: "Bali Beach & Temple Retreat", offset: 18, duration: 7, status: "UPCOMING" as const, cities: ["Bali"], budget: 65000 },
      { name: "Singapore Food & Gardens Trail", offset: -45, duration: 4, status: "COMPLETED" as const, cities: ["Singapore"], budget: 70000 },
      { name: "Swiss Alps & Lakes Journey", offset: -90, duration: 10, status: "COMPLETED" as const, cities: ["Zurich", "Paris"], budget: 200000 },
      { name: "Vietnam Food & Culture Tour", offset: -120, duration: 8, status: "COMPLETED" as const, cities: ["Bangkok"], budget: 50000 },
      { name: "Rajasthan Royal Heritage Tour", offset: 35, duration: 6, status: "UPCOMING" as const, cities: ["Rome", "Barcelona"], budget: 85000 },
      { name: "London Museums & Theatre Week", offset: -60, duration: 6, status: "COMPLETED" as const, cities: ["London"], budget: 110000 },
      { name: "Istanbul East Meets West Culture", offset: -150, duration: 5, status: "COMPLETED" as const, cities: ["Istanbul"], budget: 60000 },
      { name: "Cancelled Bali Surfing Expedition", offset: 40, duration: 5, status: "DRAFT" as const, cities: ["Bali"], budget: 45000 },
      { name: "Tokyo Cherry Blossom Festival", offset: 60, duration: 7, status: "UPCOMING" as const, cities: ["Tokyo"], budget: 130000 },
      { name: "Rome & Vatican City Pilgrimage", offset: -200, duration: 5, status: "COMPLETED" as const, cities: ["Rome"], budget: 95000 },
    ];

    for (const bConfig of busyTripConfigs) {
      await buildDemoTrip({
        userId: userMaya._id,
        name: bConfig.name,
        startDaysOffset: bConfig.offset,
        durationDays: bConfig.duration,
        status: bConfig.status,
        plannedBudget: bConfig.budget,
        cityNames: bConfig.cities,
      });
    }

    // ==================================================
    // USER 3 — New Traveler (empty@globetrotter.dev)
    // Genuine 0 Trips Account for Empty State Verification
    // ==================================================

    // ==================================================
    // SEED TRIPS FOR USER 4 — Budget Traveler (budget@globetrotter.dev)
    // Testing Budget States (Under, Near, Over Budget)
    // ==================================================
    const userBudget = createdUsersMap["budget@globetrotter.dev"];

    // 1. Comfortably Under Budget Trip
    await buildDemoTrip({
      userId: userBudget._id,
      name: "Prague Budget Backpacking",
      startDaysOffset: 15,
      durationDays: 5,
      status: "UPCOMING",
      plannedBudget: 100000,
      cityNames: ["Prague"],
    });

    // 2. Over Budget Trip (Triggers Over Budget & Over Budget Days Alert)
    await buildDemoTrip({
      userId: userBudget._id,
      name: "High Cost Tokyo & Kyoto Tour",
      startDaysOffset: -2,
      durationDays: 6,
      status: "ONGOING",
      plannedBudget: 60000, // Budget 60k but expenses high -> Over budget
      cityNames: ["Tokyo", "Kyoto"],
      addOverBudgetExpenses: true,
      customActivitiesPerDay: 5, // Many activities on single days
    });

    // ==================================================
    // SEED TRIPS FOR USER 5 — Travel Creator (creator@globetrotter.dev)
    // Public / Shared Itineraries for Community Discovery
    // ==================================================
    const userCreator = createdUsersMap["creator@globetrotter.dev"];

    const publicTripConfigs = [
      {
        name: "Ultimate Japan 10-Day Discovery",
        publicId: "pub-japan-ultimate-10day",
        desc: "The ultimate 10-day route covering Tokyo neon, Kyoto shrines, and Osaka street food.",
        cities: ["Tokyo", "Kyoto", "Osaka"],
        budget: 120000,
        cover: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Classic Grand Tour of Italy",
        publicId: "pub-italy-grand-tour",
        desc: "Rome Colosseum, Vatican treasures, Florence museums, and Venice canals.",
        cities: ["Rome", "Paris"],
        budget: 180000,
        cover: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Southeast Asia Tropical Loop",
        publicId: "pub-southeast-asia-loop",
        desc: "Backpacking through Bangkok temples and Bali beach sunsets.",
        cities: ["Bangkok", "Bali"],
        budget: 75000,
        cover: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
      },
      {
        name: "Secret Paris Architecture & Cafes",
        publicId: "pub-secret-paris-architecture",
        desc: "Hidden courtyard cafes, Montmartre artists, and Gothic basilicas.",
        cities: ["Paris"],
        budget: 110000,
        cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
      },
    ];

    for (const pConfig of publicTripConfigs) {
      await buildDemoTrip({
        userId: userCreator._id,
        name: pConfig.name,
        description: pConfig.desc,
        coverPhoto: pConfig.cover,
        startDaysOffset: 10,
        durationDays: 8,
        status: "UPCOMING",
        visibility: "PUBLIC",
        publicId: pConfig.publicId,
        plannedBudget: pConfig.budget,
        cityNames: pConfig.cities,
      });
    }

    // ==================================================
    // PRINT DEMO SUMMARY REPORT
    // ==================================================
    console.log("==================================================");
    console.log("  GLOBALTROTTER DEMO DATA SEEDED SUCCESSFULLY");
    console.log("==================================================");
    console.log("DEMO ACCOUNTS (Password: Demo@12345):");
    console.log("1. Normal Active User : demo@globetrotter.dev    (Alex Traveler)");
    console.log("2. Busy Traveler      : busy@globetrotter.dev    (Maya Explorer - 12 trips)");
    console.log("3. Empty State User   : empty@globetrotter.dev   (New Traveler - 0 trips)");
    console.log("4. Budget Edge User   : budget@globetrotter.dev  (Budget Traveler)");
    console.log("5. Public Creator     : creator@globetrotter.dev (Travel Creator - 4 public trips)");
    console.log("==================================================");
    console.log(`Users Created       : ${Object.keys(createdUsersMap).length}`);
    console.log(`Trips Created       : ${totalTripsCount}`);
    console.log(`Trip Stops Created  : ${totalStopsCount}`);
    console.log(`Activities Scheduled: ${totalItineraryActivitiesCount}`);
    console.log(`Expenses Logged     : ${totalExpensesCount}`);
    console.log(`Public Itineraries  : ${totalPublicItinerariesCount}`);
    console.log("==================================================");

    process.exit(0);
  } catch (err) {
    console.error("Fatal Error seeding demo data:", err);
    process.exit(1);
  }
};

seedDemoData();
