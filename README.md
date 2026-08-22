# 🌍 GlobeTrotter — Agentic Travel Planning Platform

GlobeTrotter is an intelligent, collaborative MERN-stack travel platform powered by an **Agentic AI engine (Groq API)**. It enables users to discover cities, plan multi-day itineraries, manage travel budgets, share public itineraries, and collaborate with an AI assistant that can execute real database tool actions upon user confirmation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express.js, Mongoose, TypeScript.
- **Database**: MongoDB (User, Trip, City, Activity, TripStop, ItineraryActivity, Expense, AIUsage).
- **AI Agentic Layer**: Groq API (`groq-sdk` with `llama-3.3-70b-versatile`) with server-side allowlisted tool calling.
- **Authentication & Security**: JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (`USER` / `ADMIN`), non-blocking AI monitoring, CORS, rate limiting.

---

## 🚀 Key Features by Phase

1. **PHASE 1 — Foundation**: MERN architecture, Express API, Vite React frontend, `/api/health` monitoring.
2. **PHASE 2 — Auth & Profiles**: Registration, JWT login, profile settings, travel preferences (`travelStyle`, `interests`, `travelPace`).
3. **PHASE 3 — Trips & Discovery**: Trip creation, destination city search, activity discovery catalog, saved destinations.
4. **PHASE 4 — Itinerary Engine**: Multi-city trip stops, day-by-day itinerary builder, activity reordering, calendar timeline.
5. **PHASE 5 — Budget & Community**: Category expense tracking, daily budget breakdown, public itinerary sharing, trip copying.
6. **PHASE 6 — Agentic AI Engine**: Groq LLM tool calling, multi-turn travel context, write action proposals with user confirmation.
7. **PHASE 7 — Admin Analytics & Polish**: Deterministic platform metrics dashboard, user management table (search, filter, role switch, account status toggle), AI monitoring, global error boundaries, 403/404 handling.

---

## ⚙️ Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   # Install root concurrently script runner
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` in the root directory and server directory:
   ```bash
   cp .env.example .env
   ```

   **Environment Variables Reference**:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://127.0.0.1:27017/globetrotter
   JWT_SECRET=globetrotter_default_secret_key_2026
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Seed Database (Demo Content)**:
   ```bash
   cd server
   npx ts-node src/seed/seedData.ts
   ```

---

## 💻 Development Commands

```bash
# Run both Client (Vite) and Server (Express) concurrently
npm run dev

# Run Client only (Port 5173)
cd client && npm run dev

# Run Server only (Port 5000)
cd server && npm run dev

# Production Build Checks
cd client && npm run build
cd server && npx tsc --noEmit
```

---

## 🛡️ Admin & Security Configuration

- **Admin Account Creation**: Users can be assigned the `ADMIN` role via MongoDB or promoted in the Admin Dashboard.
- **Admin Dashboard Route**: `/admin` (Protected by `<AdminRoute />` on client and `verifyUser` + `requireRole("ADMIN")` on Express server).
- **Health Check Endpoint**:
  ```http
  GET /api/health
  ```
  Returns real-time database connection status (`connected` / `disconnected`) and environment info.

---

## 🎬 Hackathon Demo Flow

1. **Dashboard**: View active journeys and KPI summary metrics.
2. **AI Planning**: Ask GlobeTrotter AI: *"Plan a 5-day Japan trip under ₹50,000 focused on food and culture."*
3. **Trip Creation**: Confirm AI proposal to automatically create stops and activities in MongoDB.
4. **Itinerary & Calendar**: Inspect day-wise itinerary schedule and timeline.
5. **AI Budget Optimization**: Ask AI: *"Bring this trip below ₹50,000 without removing food experiences."* Apply proposed activity swaps upon confirmation.
6. **Public Sharing & Community**: Publish trip, open public view URL, copy trip into another account.
7. **Admin Analytics**: Login as `ADMIN` to view deterministic user metrics, trip statistics, popular cities/activities, and AI monitoring logs.
