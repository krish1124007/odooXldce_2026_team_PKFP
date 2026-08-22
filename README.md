# 🌍 GlobeTrotter — Agentic Travel Planning Platform

GlobeTrotter is an intelligent, collaborative MERN-stack travel platform powered by an **Agentic AI engine (Groq API)**. It enables users to discover cities, plan multi-day itineraries, manage travel budgets, share public itineraries, and collaborate with an AI assistant that can execute real database tool actions upon user confirmation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Vanilla CSS / Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express.js, Mongoose, TypeScript.
- **Database**: MongoDB (User, Trip, City, Activity, TripStop, ItineraryActivity, Expense, AIUsage).
- **AI Agentic Layer**: Groq API (`groq-sdk` with `llama-3.3-70b-versatile`) with server-side allowlisted tool calling and action confirmation store.
- **Authentication & Security**: JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (`USER` / `ADMIN`), CORS, rate limiting, centralized error handling.

---

## 🚀 Key Features by Phase

1. **PHASE 1 — Foundation**: MERN architecture, Express API, Vite React frontend, `/api/health` monitoring.
2. **PHASE 2 — Auth & Profiles**: Registration, JWT login, profile settings, travel preferences (`travelStyle`, `interests`, `travelPace`).
3. **PHASE 3 — Trips & Discovery**: Trip creation, destination city search, activity discovery catalog, saved destinations.
4. **PHASE 4 — Itinerary Engine**: Multi-city trip stops, day-by-day itinerary builder, activity reordering, calendar timeline.
5. **PHASE 5 — Budget & Community**: Category expense tracking, daily budget breakdown, public itinerary sharing, trip copying.
6. **PHASE 6 — Agentic AI Engine**: Groq LLM tool calling, multi-turn travel context, write action proposals with user confirmation.
7. **PHASE 7 — Admin Analytics**: Deterministic platform metrics dashboard, user management table (search, filter, role switch, account status toggle), AI monitoring.
8. **PHASE 8 — Final Hardening**: Complete API error auditing, zero console errors, database indexes, seed scripts, and hackathon demo readiness.

---

## 📋 Complete API Inventory

| Group | Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|---|
| **HEALTH** | GET | `/api/health` | No | Real-time server and MongoDB connection health status |
| **AUTH** | POST | `/api/auth/register` | No | Register new user account |
| **AUTH** | POST | `/api/auth/login` | No | Authenticate user and issue JWT token |
| **AUTH** | POST | `/api/auth/logout` | Yes | Logout current user session |
| **AUTH** | GET | `/api/auth/me` | Yes | Fetch authenticated user profile data |
| **AUTH** | POST | `/api/auth/forgot-password` | No | Request password reset token |
| **AUTH** | POST | `/api/auth/reset-password` | No | Reset user password using token |
| **USER** | GET | `/api/users/profile` | Yes | Get user profile details |
| **USER** | PUT | `/api/users/profile` | Yes | Update user profile and travel preferences |
| **USER** | POST | `/api/users/saved-destinations` | Yes | Save a city to user bookmarks |
| **USER** | DELETE | `/api/users/saved-destinations/:destinationId` | Yes | Remove a saved city bookmark |
| **USER** | DELETE | `/api/users/account` | Yes | Delete user account |
| **TRIPS** | POST | `/api/trips` | Yes | Create a new trip itinerary |
| **TRIPS** | GET | `/api/trips` | Yes | List user trips with search/filter |
| **TRIPS** | GET | `/api/trips/:id` | Yes | Get trip details by ID |
| **TRIPS** | PUT | `/api/trips/:id` | Yes | Update trip details |
| **TRIPS** | DELETE | `/api/trips/:id` | Yes | Delete trip and clean up associated stops/activities |
| **TRIPS** | PUT | `/api/trips/:id/publish` | Yes | Publish trip and generate public URL |
| **TRIPS** | PUT | `/api/trips/:id/unpublish` | Yes | Unpublish trip (make private) |
| **TRIPS** | POST | `/api/trips/:id/copy` | Yes | Copy a public trip to user account |
| **CITIES** | GET | `/api/cities` | No | Search and filter cities catalog |
| **CITIES** | GET | `/api/cities/:id` | No | Get single city details and activities |
| **CITIES** | POST | `/api/cities` | Admin | Add new city to catalog |
| **ACTIVITIES** | GET | `/api/activities` | No | Search and filter activities by city, type, budget |
| **ACTIVITIES** | GET | `/api/activities/:id` | No | Get single activity details |
| **ACTIVITIES** | POST | `/api/activities` | Admin | Add new activity to catalog |
| **ITINERARY** | GET | `/api/itinerary/:tripId` | Yes | Fetch complete trip itinerary (stops + activities) |
| **ITINERARY** | POST | `/api/stops` | Yes | Add a destination city stop to a trip |
| **ITINERARY** | DELETE | `/api/stops/:stopId` | Yes | Remove a stop and its scheduled activities |
| **ITINERARY** | POST | `/api/itinerary-activities` | Yes | Schedule an activity on a specific date/time |
| **ITINERARY** | DELETE | `/api/itinerary-activities/:id` | Yes | Remove a scheduled activity |
| **ITINERARY** | PUT | `/api/itinerary-activities/reorder` | Yes | Reorder itinerary activities |
| **BUDGET** | GET | `/api/budget/:tripId` | Yes | Calculate comprehensive budget breakdown |
| **BUDGET** | POST | `/api/budget/:tripId/expenses` | Yes | Add an expense item to a trip |
| **BUDGET** | DELETE | `/api/budget/:tripId/expenses/:expenseId` | Yes | Delete an expense item |
| **PUBLIC** | GET | `/api/public/trips/:publicId` | No | Access public trip itinerary (sanitized view) |
| **COMMUNITY** | GET | `/api/public/community` | No | Explore community public trip gallery |
| **AGENT** | POST | `/api/agent/chat` | Yes | Send prompt to Groq AI agent with tool execution |
| **AGENT** | POST | `/api/agent/confirm` | Yes | Apply proposed AI write actions to database |
| **ADMIN** | GET | `/api/admin/overview` | Admin | Fetch platform analytics KPIs |
| **ADMIN** | GET | `/api/admin/users` | Admin | Search, filter, and paginate user accounts |
| **ADMIN** | PUT | `/api/admin/users/:id/role` | Admin | Toggle user role (`USER` / `ADMIN`) |
| **ADMIN** | PUT | `/api/admin/users/:id/status` | Admin | Enable/disable user account |
| **ADMIN** | GET | `/api/admin/analytics/trips` | Admin | View detailed trip metrics |
| **ADMIN** | GET | `/api/admin/analytics/cities` | Admin | View popular cities analytics |
| **ADMIN** | GET | `/api/admin/analytics/ai` | Admin | View AI model usage and tool invocation stats |

---

## ⚙️ Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `server` directory based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://127.0.0.1:27017/globetrotter
   JWT_SECRET=globetrotter_default_secret_key_2026
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. **Seed Database (Demo Content)**:
   ```bash
   cd server
   npm run seed:demo
   ```

---

## 💻 Development Commands

```bash
# Run Client (Port 5173)
cd client && npm run dev

# Run Server (Port 5000)
cd server && npm run dev

# Production Build Checks
cd client && npm run build
cd server && npm run build
```

---

## 🛡️ Admin & Security Configuration

- **Admin Dashboard Route**: `/admin` (Protected by `<AdminRoute />` on client and `verifyUser` + `requireRole("ADMIN")` on Express server).
- **Health Check Endpoint**:
  ```http
  GET /api/health
  ```
  Returns real-time database connection status (`healthy` / `degraded`) and environment info.

---

## 🎬 Hackathon Demo Flow Script

1. **Dashboard**: View active journeys and KPI summary metrics.
2. **AI Planning**: Open GlobeTrotter AI and ask: *"Plan a 5-day Japan trip under ₹50,000 focused on food and culture."*
3. **Trip Creation**: Confirm AI proposal to automatically create stops and activities in MongoDB.
4. **Itinerary & Calendar**: Inspect day-wise itinerary schedule and calendar timeline.
5. **AI Budget Optimization**: Ask AI: *"Bring this trip below ₹50,000 without removing food experiences."* Apply proposed activity swaps upon confirmation.
6. **Public Sharing & Community**: Publish trip, open public view URL, copy trip into another account.
7. **Admin Analytics**: Login as `ADMIN` to view deterministic user metrics, trip statistics, popular cities/activities, and AI monitoring logs.
