import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.models.js";
import { Trip } from "./models/trip.models.js";
import { City } from "./models/city.models.js";
import { Activity } from "./models/activity.models.js";
import { processAgentChat } from "./agents/orchestrator.js";
import { createPendingAction, getPendingAction, removePendingAction } from "./agents/actionStore.js";
import { executeTool } from "./agents/toolRegistry.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/globetrotter";

const runTests = async () => {
  console.log("==========================================");
  console.log("   PHASE 6 AGENTIC AI INTEGRATION TESTS   ");
  console.log("==========================================");

  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, title: string) => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      failed++;
    }
  };

  // Setup Test User & Trip
  let user = await User.findOne({ email: "agenttest@globetrotter.com" });
  if (!user) {
    user = await User.create({
      firstName: "AgentTester",
      lastName: "Groq",
      email: "agenttest@globetrotter.com",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuuu",
      travelStyle: "Budget",
      interests: ["Food", "Culture"],
    });
  }

  const userId = user._id.toString();

  const city = await City.findOne({ name: "Tokyo" });
  const act1 = city ? await Activity.findOne({ cityId: city._id as any }) : null;

  let trip = await Trip.findOne({ name: "Test AI Trip" });
  if (!trip) {
    trip = await Trip.create({
      userId: userId as any,
      user: userId as any,
      name: "Test AI Trip",
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 86400000),
      budget: { amount: 50000, currency: "INR" },
      destinations: city ? [city._id as any] : [],
      activities: act1 ? [act1._id as any] : [],
    } as any);
  }

  // TEST 1: User Preferences Tool
  const userPrefRes = await executeTool("get_user_preferences", {}, userId);
  assert(userPrefRes.success && userPrefRes.data.travelStyle === "Budget", "TEST 1: get_user_preferences tool works");

  // TEST 2: City Search Tool
  const citySearchRes = await executeTool("search_cities", { region: "Asia", limit: 5 }, userId);
  assert(citySearchRes.success && citySearchRes.data.length > 0, "TEST 2: search_cities tool works");

  // TEST 3: Activity Search Tool
  const actSearchRes = await executeTool("search_activities", { maxCost: 2000, limit: 5 }, userId);
  assert(actSearchRes.success && actSearchRes.data.length > 0, "TEST 3: search_activities tool works");

  // TEST 4: Calculate Trip Budget Tool
  const budgetRes = await executeTool("calculate_trip_budget", { tripId: trip._id.toString() }, userId);
  assert(budgetRes.success && budgetRes.data.plannedBudget === 50000, "TEST 4: calculate_trip_budget tool works");

  // TEST 5: Find Budget Savings Tool
  const savingsRes = await executeTool("find_budget_savings", { tripId: trip._id.toString() }, userId);
  assert(savingsRes.success && savingsRes.data.tripId === trip._id.toString(), "TEST 5: find_budget_savings tool works");

  // TEST 6: Get Itinerary Tool
  const itineraryRes = await executeTool("get_itinerary", { tripId: trip._id.toString() }, userId);
  assert(itineraryRes.success && itineraryRes.data.tripName === "Test AI Trip", "TEST 6: get_itinerary tool works");

  // TEST 7: Detect Schedule Conflicts Tool
  const conflictRes = await executeTool("detect_schedule_conflicts", { tripId: trip._id.toString() }, userId);
  assert(conflictRes.success && Array.isArray(conflictRes.conflicts), "TEST 7: detect_schedule_conflicts tool works");

  // TEST 8: Write Action Confirmation & Store
  const action = createPendingAction({
    userId,
    toolName: "update_trip",
    args: { tripId: trip._id.toString(), name: "Updated AI Trip Title" },
    summary: "Update trip title to Updated AI Trip Title",
  });

  assert(Boolean(action.actionId && action.expiresAt > Date.now()), "TEST 8A: createPendingAction creates actionId with expiration");

  const fetchedAction = getPendingAction(action.actionId, userId);
  assert(fetchedAction !== null && fetchedAction.actionId === action.actionId, "TEST 8B: getPendingAction verifies action ownership & validity");

  const otherUserAction = getPendingAction(action.actionId, "wrongUserId123");
  assert(otherUserAction === null, "TEST 8C: getPendingAction rejects unauthorized user access");

  // Execute Action
  const execRes = await executeTool(fetchedAction!.toolName, fetchedAction!.args, userId);
  removePendingAction(action.actionId);
  const reFetch = getPendingAction(action.actionId, userId);
  assert(execRes.success && reFetch === null, "TEST 8D: Approved action executes and invalidates store item");

  // TEST 9: Agent Orchestrator Request Process
  const agentRes = await processAgentChat({
    userId,
    message: "Plan a trip to Japan under ₹50,000",
    context: { page: "dashboard" },
  });

  assert(agentRes.success && agentRes.data.message.length > 0, "TEST 9: processAgentChat returns structured AI response");

  console.log("\n==========================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED  `);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
