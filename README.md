# Storefront Ratings

Role-based store rating platform: Express + PostgreSQL backend, React (Vite) frontend.
Roles: **System Administrator**, **Normal User**, **Store Owner**, all through a single login.

## Setup

Requirements: Node 18+, PostgreSQL 13+.

### 1. Database and backend
```bash
createdb store_ratings
cd backend
cp .env.example .env        # edit DATABASE_URL and JWT_SECRET
npm install
npm run seed                # creates tables, the admin account and demo data
npm run dev                 # API on http://localhost:4000
```
Use `node src/seed.js --no-demo` to create only the tables and the admin.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :4000)
```
For a separate API host, set `VITE_API_URL` and `CORS_ORIGIN`.

## Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@1234 (from `.env`) |
| Store owner | owner@example.com | Passw0rd! |
| Normal user | user1@example.com | Passw0rd! |

## API
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/signup, /api/auth/login | public |
| PUT | /api/auth/password | any logged-in user |
| GET | /api/admin/stats | admin |
| POST | /api/admin/users, /api/admin/stores | admin |
| GET | /api/admin/users, /api/admin/users/:id, /api/admin/stores | admin (filters: name, email, address, role; sort, order) |
| GET | /api/stores?search=&sort=&order= | user |
| PUT | /api/stores/:id/rating  `{ "rating": 1-5 }` | user (insert or update) |
| GET | /api/owner/dashboard?sort=&order= | store owner |

