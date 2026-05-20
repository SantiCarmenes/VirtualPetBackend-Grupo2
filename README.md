# VirtualPet Backend

REST API for VirtualPet — an e-commerce platform for pet products built with NestJS, Prisma, and PostgreSQL. Covers the full order lifecycle: catalog browsing, cart management, checkout, payments, shipping, and inventory tracking.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Email | Resend |
| Containerization | Docker |
| Cloud | Google Cloud Run |
| Node | 22.x |

---

## Features

- **Authentication** — JWT-based login/register with refresh tokens and password reset via email
- **Catalog** — Hierarchical categories (3-level tree), products with dynamic attributes and multi-image variants, full-text search with Spanish stemming, price and attribute filters
- **Cart** — Per-user persistent cart with price snapshots at add time
- **Checkout** — Authenticated and guest checkout flows with stock validation, shipping cost calculation, and promotion application
- **Orders** — Full order lifecycle (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED) with transactional email notifications on each status change
- **Payments** — Payment recording with support for CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER
- **Shipping** — Configurable shipping methods with tracking numbers and status updates
- **Inventory** — Multi-warehouse stock management with per-warehouse reservation validation
- **Promotions** — Discount codes with usage limits, date ranges, and custom conditions
- **Email** — Responsive HTML email templates for order confirmation, status updates, and password reset

---

## Architecture

The project uses two architectural styles depending on module complexity:

### Layered Architecture (Controller → Service → Repository)
Applied to: `auth`, `user`, `catalog`, `inventory`, `order`

```
Controller  →  Service  →  Repository  →  Prisma (PostgreSQL)
```

### Hexagonal Architecture (Ports & Adapters)
Applied to: `payment`, `shipping`

```
HTTP Controller (Adapter)
       ↓
Application Port (Interface)
       ↓
Domain (pure business logic)
       ↓
Repository Adapter (Prisma)
```

### Database Schema Isolation

The database is split into **7 PostgreSQL schemas** to enforce bounded contexts. Cross-schema references use plain fields (no FK constraints across schemas); integrity is enforced at the application layer.

| Schema | Models |
|---|---|
| `user` | User, Address |
| `auth` | RefreshToken, PasswordResetToken |
| `catalog` | Category, Product, ProductVariant, ProductImage, Attribute, AttributeValue, ProductAttribute, ProductVariantAttribute |
| `order` | Cart, CartItem, Order, OrderItem, Promotion, AppliedPromotion |
| `payment` | Payment |
| `shipping` | ShippingMethod, Shipment |
| `inventory` | Warehouse, StockItem, StockReservation |

---

## Getting Started

### Prerequisites

- Node.js 22.x
- npm 10+
- PostgreSQL 16
- Docker (optional)

### Installation

```bash
git clone https://github.com/gian-magliotti/virtualpet-back.git
cd virtualpet-back/backend-virtualpet
npm install
```

### Environment Variables

Create a `.env` file in the `backend-virtualpet` directory:

```env
# Database
DATABASE_URL="postgresql://virtualpet:virtualpet@localhost:5432/virtualpet"

# Auth
JWT_SECRET="your-very-secret-key-here"

# Server
PORT=3000
FRONTEND_URL="http://localhost:4000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
MAIL_FROM="Virtual Pet <onboarding@resend.dev>"
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `PORT` | Port the server listens on | No (default: 3000) |
| `FRONTEND_URL` | Allowed CORS origin(s) — comma-separated for multiple | Yes |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) | Yes |
| `MAIL_FROM` | Sender address for transactional emails | No |

---

## Running the App

### With Docker Compose (recommended for local dev)

```bash
# Start PostgreSQL
docker compose up -d

# Run migrations and seed
npx prisma migrate deploy
npm run db:seed

# Start in watch mode
npm run start:dev
```

### Without Docker

```bash
# Run migrations
npx prisma migrate deploy

# Seed the database
npm run db:seed

# Development (watch mode)
npm run start:dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm run start:prod` | Run migrations and start production server |
| `npm run db:seed` | Seed the database with initial data |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage report |

---

## Database

### Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Create a new migration (dev only)
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (GUI)
npx prisma studio
```

### Data Model Overview

```
Category (tree)
└── Product
    ├── ProductVariant ── ProductImage
    │                 └── ProductVariantAttribute ── AttributeValue ── Attribute
    └── ProductImage

Cart ── CartItem (price snapshot)

Order ── OrderItem (price snapshot)
      └── AppliedPromotion ── Promotion

Warehouse ── StockItem ── StockReservation
```

---

## API Documentation

Full endpoint reference, request/response schemas, and authentication details are available at:

**[https://api-virtualpet.vercel.app](https://api-virtualpet.vercel.app)**

---

## Project Structure

```
src/
├── auth/                    # JWT authentication, guards, strategies, decorators
├── catalog/                 # Products, categories, attributes, variants
├── order/                   # Cart, checkout, orders, promotions
├── payment/                 # Payments — Hexagonal Architecture
│   ├── application/
│   │   └── ports/
│   │       ├── inbound/     # Service interfaces
│   │       └── outbound/    # Repository interfaces
│   ├── domain/              # Pure domain entities
│   └── infrastructure/
│       ├── http/            # Controllers
│       └── persistence/     # Prisma adapters
├── shipping/                # Shipping — Hexagonal Architecture (same structure as payment)
├── inventory/               # Warehouses and stock management
├── user/                    # User profile and addresses
├── mail/                    # Transactional email service (Resend)
├── prisma/                  # Schema, migrations, seeds
├── common/
│   └── interceptors/
│       └── logging.interceptor.ts
├── app.module.ts
└── main.ts                  # Bootstrap: CORS, validation pipe, interceptors
```

---

## Deployment

The application deploys to **Google Cloud Run** automatically on push to `main` via Cloud Build.

The `start:prod` script runs `prisma migrate deploy` before starting the server — no manual migration step needed.

### Docker

```bash
docker build -t virtualpet-backend .

docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e RESEND_API_KEY="..." \
  -e FRONTEND_URL="https://yourfrontend.com" \
  virtualpet-backend
```

### Required environment variables in Cloud Run

```
DATABASE_URL
JWT_SECRET
RESEND_API_KEY
MAIL_FROM
FRONTEND_URL
```
