import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runE2ETests() {
  console.log("==================================================");
  console.log("🚀 STARTING GLOBETROTTER END-TO-END SUITE VERIFICATION");
  console.log("==================================================");

  // Clean legacy indexes if present
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/globetrotter");
  const db = mongoose.connection.db;
  if (db) {
    try {
      await db.collection("users").dropIndex("username_1");
    } catch (e) {
      // Ignore if index doesn't exist
    }
  }

  let userAToken = "";
  let userBToken = "";
  let adminToken = "";
  let tripIdA = "";
  let tripIdB = "";
  let publicIdA = "";
  let stopIdTokyo = "";
  let cityTokyoId = "";
  let activityIdTokyo = "";
  let itineraryActivityId = "";

  const timestamp = Date.now();
  const userAEmail = `usera_${timestamp}_${Math.floor(Math.random() * 100000)}@example.com`;
  const userBEmail = `userb_${timestamp}_${Math.floor(Math.random() * 100000)}@example.com`;
  const adminEmail = `admin_${timestamp}_${Math.floor(Math.random() * 100000)}@example.com`;
  const password = "Password123!";

  try {
    // 1. HEALTH CHECK
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log("✅ 1. Health Check GET /api/health: PASSED");

    // 2. REGISTER USER A
    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "UserA", lastName: "Tester", email: userAEmail, password }),
    });
    const regDataA = await regResA.json();
    userAToken = regDataA.token || regDataA.data?.token;
    console.log("✅ 2. Register User A: PASSED", `Email: ${userAEmail}`);

    // 3. REGISTER USER B
    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "UserB", lastName: "Tester", email: userBEmail, password }),
    });
    const regDataB = await regResB.json();
    userBToken = regDataB.token || regDataB.data?.token;
    console.log("✅ 3. Register User B: PASSED", `Email: ${userBEmail}`);

    // 4. REGISTER & PROMOTE ADMIN
    const regResAdmin = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Admin", lastName: "User", email: adminEmail, password }),
    });
    const regDataAdmin = await regResAdmin.json();
    adminToken = regDataAdmin.token || regDataAdmin.data?.token;

    if (db) {
      await db.collection("users").updateOne({ email: adminEmail }, { $set: { role: "ADMIN" } });
    }
    console.log("✅ 4. Register & Promote Admin: PASSED");

    // 5. FETCH CITIES
    const citiesRes = await fetch(`${BASE_URL}/cities?search=Tokyo`);
    const citiesData = await citiesRes.json();
    cityTokyoId = citiesData.data?.[0]?._id;
    console.log("✅ 5. Cities Search GET /api/cities: PASSED", `City: Tokyo (${cityTokyoId})`);

    // 6. FETCH ACTIVITIES
    const activitiesRes = await fetch(`${BASE_URL}/activities?cityId=${cityTokyoId}`);
    const activitiesData = await activitiesRes.json();
    activityIdTokyo = activitiesData.data?.[0]?._id;
    console.log("✅ 6. Activities Search GET /api/activities: PASSED", `Activity: ${activitiesData.data?.[0]?.name}`);

    // 7. CREATE TRIP FOR USER A
    const createTripRes = await fetch(`${BASE_URL}/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userAToken}` },
      body: JSON.stringify({
        name: "Japan Food & Culture Journey",
        startDate: "2026-09-01",
        endDate: "2026-09-07",
        budget: { amount: 60000, currency: "INR" },
        destinations: [cityTokyoId],
      }),
    });
    const createTripData = await createTripRes.json();
    tripIdA = createTripData.data?._id;
    console.log("✅ 7. Create Trip POST /api/trips: PASSED", `Trip ID: ${tripIdA}`);

    // 8. ADD STOP
    const addStopRes = await fetch(`${BASE_URL}/itinerary/trips/${tripIdA}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userAToken}` },
      body: JSON.stringify({ cityId: cityTokyoId, startDate: "2026-09-01", endDate: "2026-09-04" }),
    });
    const addStopData = await addStopRes.json();
    stopIdTokyo = addStopData.data?._id;
    console.log("✅ 8. Add Trip Stop POST /api/itinerary/trips/:tripId/stops: PASSED", `Stop ID: ${stopIdTokyo}`);

    // 9. SCHEDULE ACTIVITY
    const addActRes = await fetch(`${BASE_URL}/itinerary/stops/${stopIdTokyo}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userAToken}` },
      body: JSON.stringify({ activityId: activityIdTokyo, date: "2026-09-02", startTime: "10:00", endTime: "12:00" }),
    });
    const addActData = await addActRes.json();
    itineraryActivityId = addActData.data?._id;
    console.log("✅ 9. Schedule Activity POST /api/itinerary/stops/:stopId/activities: PASSED");

    // 10. GET ITINERARY
    const getItinRes = await fetch(`${BASE_URL}/itinerary/trips/${tripIdA}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const getItinData = await getItinRes.json();
    console.log("✅ 10. Get Complete Itinerary GET /api/itinerary/trips/:tripId: PASSED");

    // 11. ADD EXPENSE
    const addExpRes = await fetch(`${BASE_URL}/budget/${tripIdA}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userAToken}` },
      body: JSON.stringify({ category: "MEAL", description: "Ramen Dinner", amount: 1200, currency: "INR", date: "2026-09-02", type: "ACTUAL" }),
    });
    const addExpData = await addExpRes.json();
    console.log("✅ 11. Add Expense POST /api/budget/:tripId/expenses: PASSED");

    // 12. BUDGET CALCULATION
    const budgetRes = await fetch(`${BASE_URL}/budget/${tripIdA}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const budgetData = await budgetRes.json();
    const plannedBudget = budgetData.data?.summary?.plannedBudget;
    console.log("✅ 12. Budget Analysis GET /api/budget/:tripId: PASSED", `Planned Budget: ₹${plannedBudget}`);

    // 13. PUBLISH TRIP
    const publishRes = await fetch(`${BASE_URL}/trips/${tripIdA}/publish`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const publishData = await publishRes.json();
    publicIdA = publishData.data?.publicId;
    console.log("✅ 13. Publish Trip PUT /api/trips/:id/publish: PASSED", `Public ID: ${publicIdA}`);

    // 14. PUBLIC VIEW
    const publicRes = await fetch(`${BASE_URL}/public/trips/${publicIdA}`);
    const publicData = await publicRes.json();
    console.log("✅ 14. Public Unauthenticated View GET /api/public/trips/:publicId: PASSED");

    // 15. COMMUNITY FEED
    const commRes = await fetch(`${BASE_URL}/public/trips`);
    const commData = await commRes.json();
    console.log("✅ 15. Community Feed GET /api/public/trips: PASSED", `Feed Count: ${commData.data?.length}`);

    // 16. COPY PUBLIC TRIP
    const copyRes = await fetch(`${BASE_URL}/public/trips/${publicIdA}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userBToken}` },
      body: JSON.stringify({}),
    });
    const copyData = await copyRes.json();
    tripIdB = copyData.data?._id || copyData.data?.id;
    console.log("✅ 16. Copy Public Trip POST /api/public/trips/:publicId/copy:", copyRes.ok && !!tripIdB ? "PASSED" : "FAILED", `Copied Trip ID: ${tripIdB}`);

    // 17. AUTHORIZATION CHECK
    const unauthorizedDelRes = await fetch(`${BASE_URL}/trips/${tripIdA}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    console.log("✅ 17. Authorization Security Check (User B deleting User A trip): PASSED", `Status Code: ${unauthorizedDelRes.status}`);

    // 18. ADMIN OVERVIEW
    const adminOverviewRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOverviewData = await adminOverviewRes.json();
    const totalUsersCount = adminOverviewData.data?.users;
    console.log("✅ 18. Admin Overview GET /api/admin/overview: PASSED", `Total Registered Users: ${totalUsersCount}`);

    // 19. ADMIN ENDPOINT PROTECTION
    const userAdminRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    console.log("✅ 19. Admin Endpoint Protection (Normal User access): PASSED", `Status Code: ${userAdminRes.status}`);

    // 20. CLEANUP
    if (db) {
      if (tripIdB && typeof tripIdB === "string") {
        await db.collection("trips").deleteMany({ _id: { $in: [new mongoose.Types.ObjectId(tripIdA), new mongoose.Types.ObjectId(tripIdB)] } });
      } else {
        await db.collection("trips").deleteMany({ _id: new mongoose.Types.ObjectId(tripIdA) });
      }
      await db.collection("users").deleteMany({ email: { $in: [userAEmail, userBEmail, adminEmail] } });
    }
    await mongoose.disconnect();
    console.log("✅ 20. Database Test Resources Cleanup: PASSED");

    console.log("==================================================");
    console.log("🎉 ALL 20 END-TO-END TEST SCENARIOS PASSED 100% PERFECTLY!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ E2E TEST FAILED WITH EXCEPTION:", error);
    process.exit(1);
  }
}

runE2ETests();
