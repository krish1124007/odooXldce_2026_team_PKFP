# 🌍 GlobeTrotter — Intelligent Agentic Travel Planning Platform

GlobeTrotter is a personalized, intelligent, and collaborative travel-planning platform powered by a MERN stack foundation and an agentic AI layer (Groq API).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM, Axios, Lucide React, CSS Custom Tokens / Tailwind
- **Backend**: Node.js, Express.js, Mongoose, TypeScript
- **Database**: MongoDB
- **AI Engine (Phase 6)**: Groq API (`groq-sdk`) with tool calling (server-side only)
- **Authentication (Phase 2)**: JWT & bcrypt

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
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

   **Default Environment Variables**:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/globetrotter
   JWT_SECRET=your_jwt_secret_here
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama3-70b-8192
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 🚀 Running the Development Servers

Run frontend and backend simultaneously from the root directory:
```bash
npm run dev
```

Or run services individually:
```bash
# Run only frontend (Vite)
npm run client

# Run only backend (Express API)
npm run server
```

---

## 🟢 Health Check Endpoint

To verify backend execution and database connectivity, navigate to:
```http
GET http://localhost:5000/api/health
```

**Expected JSON Response**:
```json
{
  "success": true,
  "message": "GlobeTrotter API is running",
  "timestamp": "2026-08-22T09:15:00.000Z",
  "environment": "development"
}
```

---

## 📌 Implementation Status

- **Phase 1 — Project Foundation**: ✅ **COMPLETE**
  - Project architecture established (`/client` and `/server`).
  - React Router configured with placeholder pages for all 14 GlobeTrotter screens.
  - Reusable UI component library created (`Button`, `Input`, `Card`, `Modal`, `Loading`, `EmptyState`).
  - Centralized Axios service created with environment variable `VITE_API_URL`.
  - Express server configured with `/api/health`, CORS, JSON body parser, centralized 404/error handling, and placeholder route modules.

> **Note**: JWT authentication, database models (`User`, `Trip`, `City`, `Activity`), and Groq AI tool calling are intentionally **not** implemented in Phase 1 and will be introduced in subsequent phase prompts.
