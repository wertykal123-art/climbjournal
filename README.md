# Climb Journal

A full-stack rock climbing journal application for tracking climbs, managing routes, viewing statistics, and competing on leaderboards.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- bcrypt for password hashing
- Zod for validation

## Project Structure

```
climbing-journal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── models/        # Prisma client
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Zod validation schemas
│   │   └── utils/         # Helper functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── docker-compose.yml     # PostgreSQL for development
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd climbing-journal
```

2. Start the PostgreSQL database:
```bash
docker-compose up -d
```

3. Install server dependencies and set up database:
```bash
cd server
npm install
cp .env.example .env  # Edit with your settings if needed
npx prisma migrate dev
npx prisma generate
```

4. Install client dependencies:
```bash
cd ../client
npm install
```

### Development

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
```

3. Open http://localhost:5173 in your browser

### Environment Variables

#### Server (.env)
```
DATABASE_URL="postgresql://climbjournal:climbjournal@localhost:5432/climbjournal?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

#### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Features

### Authentication
- User registration with email, username, and password
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)

### Location Management
- Add gyms and outdoor crags
- Store address, country, and descriptions
- Track routes per location

### Route Database
- Create routes with French and UIAA grades
- Add height, protection count, visual ID, setter
- Link to locations

### Climbing Journal
- Log climbs with different styles:
  - OS (On-Sight): 2.0x points
  - FLASH: 1.8x points
  - RP (Redpoint): 1.5x points
  - PP (Pinkpoint): 1.3x points
  - TOPROPE: 1.0x points
  - AUTOBELAY: 0.8x points
  - TRY: 0.3x points
- Personal ratings (1-5 stars)
- Comments and notes
- Automatic points calculation

### Statistics
- Overview cards (total climbs, points, streaks)
- Activity timeline charts
- Grade pyramid visualization
- Climb type distribution
- Grade distribution

### Leaderboard
- Global all-time rankings
- Monthly rankings
- Weekly rankings
- Points-based competition

### Data Export/Import
- Export all data as JSON
- Import data from JSON backup

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

### Locations
- GET /api/locations
- POST /api/locations
- GET /api/locations/:id
- PUT /api/locations/:id
- DELETE /api/locations/:id

### Routes
- GET /api/routes
- POST /api/routes
- GET /api/routes/:id
- PUT /api/routes/:id
- DELETE /api/routes/:id

### Climbs
- GET /api/climbs
- POST /api/climbs
- GET /api/climbs/:id
- PUT /api/climbs/:id
- DELETE /api/climbs/:id

### Statistics
- GET /api/stats/overview
- GET /api/stats/timeline
- GET /api/stats/distribution
- GET /api/stats/types
- GET /api/stats/pyramid
- GET /api/stats/progression

### Leaderboard
- GET /api/leaderboard/global
- GET /api/leaderboard/monthly
- GET /api/leaderboard/weekly

### Export/Import
- GET /api/export/json
- POST /api/import/json

## Deployment

### Vercel (Frontend)
1. Connect repository to Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL`

### Railway/Render (Backend + Database)
1. Connect repository
2. Set root directory to `server`
3. Add environment variables
4. Railway auto-provisions PostgreSQL

### Docker
Build and run with Docker:
```bash
docker build -t climbing-journal-server ./server
docker run -p 3000:3000 climbing-journal-server
```

## Points System

| Grade | Base Points |
|-------|-------------|
| 4     | 10          |
| 5a    | 25          |
| 6a    | 130         |
| 7a    | 385         |
| 8a    | 820         |
| 9a    | 1435        |
| 9c    | 2075        |

Multiply base points by climb type multiplier for final score.

## License

MIT License
