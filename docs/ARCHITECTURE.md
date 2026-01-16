# Climb Journal - Architecture Documentation

## Overview

**Climb Journal** is a full-stack web application for rock climbers to log climbs, manage locations/routes, track statistics, and compete on leaderboards.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.0.1
- **Styling**: Tailwind CSS 3.4.15
- **Routing**: React Router DOM 6.28.0
- **HTTP Client**: Axios 1.7.7 (with JWT token refresh interceptors)
- **Charts**: Recharts 2.14.1
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js 4.21.1
- **Language**: TypeScript 5.6.3
- **ORM**: Prisma 5.22.0
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT with refresh tokens
- **Password Hashing**: bcrypt (12 salt rounds)
- **Validation**: Zod 3.23.8
- **Security**: Helmet, CORS, express-rate-limit

---

## Project Structure

```
climbjournal/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios API clients (auth, climbs, locations, routes, stats, leaderboard, export)
│   │   ├── components/         # UI components organized by feature
│   │   ├── context/            # AuthContext for global auth state
│   │   ├── pages/              # Page components (Dashboard, Journal, Stats, Leaderboard, etc.)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Helper functions
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, error, rate-limit, validation
│   │   ├── models/             # Prisma client singleton
│   │   ├── routes/             # API route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/              # JWT, password, grades, points utilities
│   │   ├── app.ts              # Express app setup
│   │   └── index.ts            # Server entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
│
└── docker-compose.yml          # PostgreSQL container for dev
```

---

## Database Schema (Prisma)

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  username       String    @unique
  displayName    String
  passwordHash   String
  profilePicture String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  locations      Location[]
  routes         Route[]
  climbs         Climb[]
}

model Location {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        String   // GYM or CRAG
  address     String?
  country     String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(...)
  routes      Route[]
}

model Route {
  id              String   @id @default(uuid())
  userId          String
  locationId      String
  name            String
  heightMeters    Float?
  protectionCount Int?
  visualId        String?
  difficultyUIAA  String?
  difficultyFrench String
  setter          String?
  description     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(...)
  location        Location @relation(...)
  climbs          Climb[]
}

model Climb {
  id             String   @id @default(uuid())
  userId         String
  routeId        String
  date           DateTime
  climbType      String   // OS|FLASH|RP|PP|TOPROPE|AUTOBELAY|TRY
  attemptCount   Int      @default(1)
  personalRating Int?     // 1-5 stars
  comments       String?
  points         Float    // Calculated from grade + climb type
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(...)
  route          Route    @relation(...)
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique  // SHA256 hash
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Cascade Deletes**: User -> Locations -> Routes -> Climbs

---

## Authentication Flow

1. **Register/Login**: Returns JWT access token (15m) + sets httpOnly refresh token cookie (7d)
2. **API Requests**: Bearer token in Authorization header
3. **Token Refresh**: Axios interceptor auto-refreshes on 401
4. **Logout**: Deletes refresh token from DB, clears cookie

**Security**:
- Refresh tokens stored as SHA256 hash in database
- httpOnly + secure + sameSite=strict cookies
- Row-level authorization (users access only their own data)

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Resources (all protected)
- `GET/POST /api/locations` - List/Create locations
- `GET/PUT/DELETE /api/locations/:id` - Location CRUD
- `GET/POST /api/routes` - List/Create routes
- `GET/PUT/DELETE /api/routes/:id` - Route CRUD
- `GET/POST /api/climbs` - List/Log climbs
- `GET/PUT/DELETE /api/climbs/:id` - Climb CRUD

### Statistics (protected)
- `GET /api/stats/overview` - Summary stats
- `GET /api/stats/timeline` - Climbs over time
- `GET /api/stats/distribution` - Grade distribution
- `GET /api/stats/pyramid` - Grade pyramid
- `GET /api/stats/progression` - Grade progression

### Leaderboard
- `GET /api/leaderboard/global` - All-time rankings
- `GET /api/leaderboard/monthly` - Monthly rankings
- `GET /api/leaderboard/weekly` - Weekly rankings

### Export/Import (protected)
- `GET /api/export/json` - Export user data
- `POST /api/import/json` - Import data

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./prisma/dev.db"           # SQLite dev
# DATABASE_URL="postgresql://user:pass@host:5432/db"  # PostgreSQL prod

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

---

## Build Commands

### Development
```bash
# Frontend (port 5173)
cd client && npm install && npm run dev

# Backend (port 3000)
cd server && npm install && npx prisma generate && npx prisma migrate dev && npm run dev

# Database (PostgreSQL)
docker-compose up -d
```

### Production Build
```bash
# Frontend - outputs to client/dist/
cd client && npm run build

# Backend - outputs to server/dist/
cd server && npm run build && npm start
```

---

## Points System

**Base Points by French Grade**: 4 (10pts) -> 9c (2075pts)

**Climb Type Multipliers**:
- On-Sight (OS): 2.0x
- Flash: 1.8x
- Redpoint (RP): 1.5x
- Pinkpoint (PP): 1.3x
- Toprope: 1.0x
- Autobelay: 0.8x
- Try (attempt): 0.3x

---

## Deployment Requirements

1. **Frontend**: Static hosting (Vercel, Netlify, etc.)
   - Set `VITE_API_URL` to backend URL

2. **Backend**: Node.js hosting (Railway, Render, Fly.io, etc.)
   - Requires Node.js 18+
   - Set all environment variables
   - Run `npx prisma migrate deploy` on deploy

3. **Database**: PostgreSQL instance
   - Can use managed DB from hosting provider
   - Update `DATABASE_URL` to PostgreSQL connection string

---

## Key Files for Deployment

- `client/package.json` - Frontend dependencies and scripts
- `client/vite.config.ts` - Build configuration
- `server/package.json` - Backend dependencies and scripts
- `server/prisma/schema.prisma` - Database schema (change provider to postgresql)
- `docker-compose.yml` - Local PostgreSQL setup
