<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <b>VirtualPet — Backend API</b><br/>
  REST API built with <a href="http://nestjs.com/" target="_blank">NestJS</a>, Prisma and PostgreSQL. Deployed on Google Cloud Run with Cloud SQL.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-22.x-brightgreen" alt="Node 22"/>
  <img src="https://img.shields.io/badge/NestJS-11-red" alt="NestJS 11"/>
  <img src="https://img.shields.io/badge/Prisma-7-blue" alt="Prisma 7"/>
  <img src="https://img.shields.io/badge/PostgreSQL-multi--schema-336791" alt="PostgreSQL"/>
</p>

## Description

REST API for the VirtualPet platform. Handles authentication, product catalog, shopping cart, order lifecycle, inventory management, payments, and shipping. Built with NestJS 11 and Prisma 7 on a multi-schema PostgreSQL database.

**Modules:**

| Module | Responsibility |
|--------|---------------|
| `auth` | JWT authentication, access/refresh tokens, guards |
| `user` | User accounts, addresses, profile |
| `catalog` | Products, variants, attributes |
| `inventory` | Warehouses, stock levels, atomic reservations |
| `order` | Cart, checkout (auth + guest), order lifecycle |
| `payment` | Payment methods, webhook processing |
| `shipping` | Shipping methods, shipments |
| `mail` | Transactional email via Brevo |

## Stack

- **Runtime:** Node.js 22
- **Framework:** NestJS 11
- **ORM:** Prisma 7 with `pg` adapter
- **Database:** PostgreSQL — multi-schema (`user`, `auth`, `catalog`, `order`, `inventory`, `payment`, `shipping`)
- **Auth:** JWT (access token 15 min + refresh token 7 days with rotation)
- **Email:** Brevo / Nodemailer
- **Deploy:** Google Cloud Run + Cloud SQL (PostgreSQL)

## Project setup

```bash
$ npm install
```

## Environment variables

Create a `.env` file at the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/virtualpet"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"

# Server
PORT=8080

# CORS — comma-separated allowed origins
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:4000"

# Email (Brevo)
BREVO_API_KEY="your_brevo_api_key"
```

## Compile and run the project

```bash
# Apply migrations
$ npx prisma migrate deploy --schema src/prisma/schema.prisma

# Seed initial data (optional)
$ npm run db:seed

# Development (watch mode)
$ npm run start:dev

# Production
$ npm run start:prod
```

The server listens on `http://localhost:8080` by default.

## Run tests

```bash
# Unit tests
$ npm run test

# Watch mode
$ npm run test:watch

# Coverage
$ npm run test:cov
```

## Deployment — Google Cloud Run + Cloud SQL

The application is containerized and deployed to **Google Cloud Run**, connected to a **Cloud SQL (PostgreSQL)** instance.

### Build and push

```bash
docker build -t gcr.io/<PROJECT_ID>/virtualpet-backend .
docker push gcr.io/<PROJECT_ID>/virtualpet-backend
```

### Deploy to Cloud Run

```bash
gcloud run deploy virtualpet-backend \
  --image gcr.io/<PROJECT_ID>/virtualpet-backend \
  --region <REGION> \
  --add-cloudsql-instances <PROJECT_ID>:<REGION>:<INSTANCE_NAME> \
  --set-env-vars DATABASE_URL="postgresql://user:password@/<DB_NAME>?host=/cloudsql/<PROJECT_ID>:<REGION>:<INSTANCE_NAME>" \
  --set-env-vars JWT_SECRET="..." \
  --set-env-vars JWT_REFRESH_SECRET="..." \
  --set-env-vars ALLOWED_ORIGINS="https://your-frontend.com,https://your-backoffice.com" \
  --set-env-vars BREVO_API_KEY="..."
```

### Migrations on deploy

`npm run start:prod` runs `prisma migrate deploy` automatically before starting the server, so migrations are applied on every deploy with no manual intervention required.

### Dockerfile

The image uses a two-stage build: a `builder` stage compiles TypeScript and generates the Prisma client, and a `runner` stage installs only production dependencies and copies the compiled output. The final image is based on `node:22-alpine`.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
