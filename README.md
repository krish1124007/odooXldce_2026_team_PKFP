# 🌍 GlobeTrotter — Personalized, Intelligent & Collaborative Travel Platform

GlobeTrotter is a personalized, intelligent, and collaborative MERN-stack travel platform powered by an **Agentic AI Engine (Groq API)**. It enables travelers to discover global destinations, construct multi-city itineraries, track travel budgets and daily expenses, share public itineraries, and collaborate with an AI assistant that can execute real database tool actions upon user confirmation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Vanilla CSS / Tailwind CSS, Lucide Icons, Recharts, Axios.
- **Backend**: Node.js, Express.js, Mongoose, TypeScript (`server/src`).
- **Database**: MongoDB (Collections: `users`, `trips`, `cities`, `activities`, `tripstops`, `itineraryactivities`, `expenses`, `aiusages`).
- **AI Agentic Layer**: Groq API (`groq-sdk` with `llama-3.3-70b-versatile`) with server-side allowlisted tool calling and action confirmation store.
- **Authentication & Security**: JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (`USER` / `ADMIN`), CORS, rate limiting, centralized error handling.

---

## 🚀 Key Features & UI Screens

1. **PHASE 1 — Foundation**: MERN architecture, Express API, Vite React frontend, `/api/health` monitoring.
2. **PHASE 2 — Auth & Profiles**: Registration, JWT login, profile settings, travel preferences (`travelStyle`, `interests`, `travelPace`).
3. **PHASE 3 — Trips & Discovery (Screen 4 & 8)**: Trip creation, destination city search, activity discovery catalog, saved destination bookmarks.
4. **PHASE 4 — Itinerary Engine & Calendar (Screen 5 & 11)**: Multi-city trip stops, day-by-day itinerary builder, activity reordering, 7-column monthly calendar timeline.
5. **PHASE 5 — Budget & Community (Screen 9 & 10)**: Category expense tracking, daily budget breakdown, donut distribution charts, public itinerary sharing, community marketplace, trip copying.
6. **PHASE 6 — Agentic AI Engine**: Groq LLM tool calling, multi-turn travel context, write action proposals with user confirmation.
7. **PHASE 7 — Admin Analytics**: Deterministic platform metrics dashboard, user management table (search, filter, role switch, account status toggle), AI monitoring logs.
8. **PHASE 8 — Development Demo Seed System**: Repeatable demo data script (`npm run seed:demo`) creating realistic accounts, trips, stops, activities, budgets, expenses, and public itineraries.

---

## 🔑 Demo Accounts (Password: `Demo@12345`)

To visually inspect the application across all UI states and edge cases, use the pre-seeded development accounts:

| Account Role / Purpose | Email Address | Password | Key UI States Covered |
| :--- | :--- | :--- | :--- |
| **Normal Active User** | `demo@globetrotter.dev` | `Demo@12345` | Healthy collection of ongoing, upcoming, completed, and draft trips. |
| **Busy Traveler** | `busy@globetrotter.dev` | `Demo@12345` | **12 trips** across multiple destinations to test crowded UI, long lists, and large calendars. |
| **Empty State User** | `empty@globetrotter.dev` | `Demo@12345` | **0 trips** account to verify true empty state dashboard, empty my trips, and empty itinerary. |
| **Budget Edge User** | `budget@globetrotter.dev` | `Demo@12345` | Trips demonstrating under-budget, near-limit, and over-budget states with daily spending alerts. |
| **Public Creator** | `creator@globetrotter.dev` | `Demo@12345` | **4 public itineraries** for testing the Community Discovery page and Public Itinerary views. |

---

## ⚙️ Installation & Quick Start

1. **Clone & Install Dependencies**:
   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

2. **Environment Setup**:
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

3. **Seed Database (Demo Data System)**:
   From the root directory or `server/` directory:
   ```bash
   npm run seed:demo
   ```
   *Seeds 5 demo accounts, 22 trips, 34 stops, 101 activities, 145 expenses, and 5 public itineraries.*

4. **Run Application**:
   From the root workspace directory:
   ```bash
   # Run both Client (5173) and Server (5000) concurrently
   npm run dev

   # Or run individually:
   npm run server   # Server dev mode
   npm run client   # Client dev mode
   ```

---

## 📋 Complete API Inventory

| Group | Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|---|
| **HEALTH** | GET | `/api/health` | No | Real-time server and MongoDB connection health status |
| **AUTH** | POST | `/api/auth/register` | No | Register new user account |
| **AUTH** | POST | `/api/auth/login` | No | Authenticate user and issue JWT token |
| **AUTH** | POST | `/api/auth/logout` | Yes | Logout current user session |
| **AUTH** | GET | `/api/auth/me` | Yes | Fetch authenticated user profile data |
| **USER** | GET | `/api/users/profile` | Yes | Get user profile details |
| **USER** | PUT | `/api/users/profile` | Yes | Update user profile and travel preferences |
| **USER** | POST | `/api/users/saved-destinations` | Yes | Save a city to user bookmarks |
| **USER** | DELETE | `/api/users/saved-destinations/:destinationId` | Yes | Remove a saved city bookmark |
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
| **ACTIVITIES** | GET | `/api/activities` | No | Search and filter activities by city, type, budget |
| **ACTIVITIES** | GET | `/api/activities/:id` | No | Get single activity details |
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

---

## 💻 Workspace Commands Summary

```bash
# Run application (Both client & server)
npm run dev

# Seed demo data (from root or server)
npm run seed:demo

# Build verification
npm run build
```

---

## 🎬 Hackathon Demo Flow Script

1. **Dashboard**: Log in as `demo@globetrotter.dev` (`Demo@12345`). View ongoing journey (`Japan Adventure`), upcoming trips, and KPI summary.
2. **City & Activity Discovery**: Open City Search (Screen 8) to explore cities with Group By, Filter, and Cost Index metrics.
3. **Itinerary Builder (Screen 5)**: Build a multi-city journey with numbered stops (`01`, `02`, `03`), city banner images, and activity schedules.
4. **Calendar Timeline (Screen 11)**: Switch to Calendar View to inspect the interactive 7-column monthly grid, day activity badges, and selected day detail panel.
5. **Trip Budget (Screen 9)**: Open Budget View to inspect Total Budget vs Actual Spent, category breakdown cards, donut distribution chart, and daily spending over-budget alerts.
6. **Public Sharing & Community (Screen 10)**: View public itinerary share links and explore the Community Trip Discovery gallery. Copy a community trip into your account.
7. **Admin Analytics**: Log in with an `ADMIN` account to view deterministic user statistics, trip metrics, and AI model usage.
