# Node.js + Express + MongoDB + TypeScript Application

A production-ready Node.js backend application built with Express, MongoDB, and TypeScript.

## Features

- ✨ **TypeScript** - Full type safety
- 🚀 **Express.js** - Fast and lightweight web framework
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM
- 🔐 **Authentication** - JWT-based auth with bcrypt password hashing
- 📧 **Email Service** - Nodemailer integration for sending emails
- 🏗️ **Clean Architecture** - Well-organized folder structure
- 🔥 **Hot Reload** - Nodemon for development

## Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- SMTP server credentials (Gmail, SendGrid, etc.)

## Getting Started

### Installation

```bash
npm install
```

### Setup Environment

Copy `.env.example` to `.env` and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SMTP_*` - Email service credentials

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Build and run in production:

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── app.ts                # Express app setup
├── admin/                # Admin model registration
│   └── model.register.ts
├── controllers/          # Route controllers
│   ├── admin/
│   └── user/
├── db/                   # Database setup
│   └── index.ts
├── interface/            # TypeScript interfaces
│   └── admin.interface.ts
├── middlewares/          # Custom middlewares
├── models/               # Mongoose models
│   └── admin.models.ts
├── routers/              # API routes
└── utils/                # Helper functions
    ├── apiResponse.ts    # Response formatting
    ├── asyncHandler.ts   # Async error handling
    ├── login.ts          # Login logic
    └── sendMail.ts       # Email sending
```

## Available Scripts

```bash
npm run dev    # Start development server with hot reload
npm run build  # Build TypeScript to JavaScript
npm start      # Run production build
```

## Key Utilities

### apiResponse - Format consistent API responses
```typescript
import { returnResponse } from "./utils/apiResponse.js";
returnResponse(res, 200, "Success", { data: "your data" });
```

### asyncHandler - Wrap async route handlers
```typescript
import { asyncHandler } from "./utils/asyncHandler.js";
router.get("/", asyncHandler(async (req, res) => {
  // Your async code
}));
```

### login - Authenticate users
```typescript
import { login } from "./utils/login.js";
const token = await login("Admin", { email }, password);
```

### sendMail - Send emails
```typescript
import { sendMail } from "./utils/sendMail.js";
await sendMail({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>"
});
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/app-name
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com
```

## License

ISC

---

Created with [create-nodets-app](https://github.com/krish112407/create-nodets-app)
