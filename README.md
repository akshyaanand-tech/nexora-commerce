# NEXORA Commerce

A full-stack premium e-commerce platform with React, Express, and PostgreSQL.

**Tagline:** Designed for Modern Shopping

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, Bcrypt |
| Images | Cloudinary (optional) |
| State | React Context API |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create database
createdb nexora

# Or via psql
psql -U postgres -c "CREATE DATABASE nexora;"
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npm run db:setup
npm run db:seed
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo Accounts

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@nexora.com   | admin123  |
| User  | demo@nexora.com    | user123   |

## Coupon Codes

- `NEXORA10` - 10% off orders over $50
- `WELCOME20` - $20 off orders over $100

## Features

- Landing page with hero, categories, trending products, testimonials
- JWT authentication with protected routes
- Product catalog with search, filters, quick view
- Product detail with image gallery and zoom
- Persistent database-backed cart with coupons
- Multi-step checkout and order confirmation
- User dashboard (orders, addresses, wishlist, settings)
- Admin dashboard (analytics, products, orders, users)
- Dark / light theme with persistence

## Project Structure

```
nexora-commerce/
├── backend/
│   ├── config/         # Database, Cloudinary
│   ├── db/             # Schema, setup, seed
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ # UI, layout, products
│   │   ├── context/    # Theme, Auth, Cart, Wishlist
│   │   ├── pages/      # All page components
│   │   └── utils/      # API client
│   └── ...
└── README.md
```

## Environment Variables

### Backend (.env)

```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexora
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=http://localhost:5173
```

Cloudinary is optional. Products can use direct image URLs.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/products | List products |
| GET | /api/products/trending | Trending products |
| GET | /api/cart | Get user cart |
| POST | /api/orders | Place order |
| GET | /api/admin/analytics | Admin analytics |

## License

MIT
