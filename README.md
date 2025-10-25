# JEWELIA Backend API

Production-ready REST API for JEWELIA - A comprehensive jewelry marketplace platform with AR preview capabilities, city-wise shop listings, and membership management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with OTP support, refresh tokens, and role-based access control (RBAC)
- **Shop Management**: Shop registration, verification, and profile management
- **Product Catalog**: Full CRUD operations with AR model support, image uploads, and advanced filtering
- **City-wise Listings**: Comprehensive Indian cities database with state, district, and taluka information
- **Payment Integration**: Razorpay integration for membership payments with webhook handling
- **Membership System**: Automated membership management with expiry tracking
- **Lead Generation**: Customer inquiry system with WhatsApp integration support
- **Search & Filtering**: Advanced product search with category, price, and purity filters
- **Admin Panel**: Complete admin dashboard with shop verification, transaction monitoring, and analytics
- **Health Checks**: Kubernetes-ready health and readiness endpoints
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Rate Limiting**: Built-in rate limiting and request throttling
- **Validation**: Comprehensive input validation with class-validator

## 📋 Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js + JWT
- **Payment Gateway**: Razorpay
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes

## 🛠️ Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+

## 📦 Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration.

### 3. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Seed the database with Indian cities and sample data:

```bash
npm run db:seed
```

This creates admin user (`admin@jewelia.com` / `admin123`), shop owner (`rajesh@example.com` / `owner123`), 100+ Indian cities, and sample products.

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

### Production Mode

```bash
npm run build
npm run start:prod
```

### Using Docker Compose

```bash
docker-compose up -d
```

## 📚 API Documentation

Visit **http://localhost:3000/api/docs** for interactive Swagger documentation.

### Key Endpoints

- **Auth**: `/auth/register`, `/auth/login`, `/auth/otp/send`, `/auth/otp/verify`
- **Cities**: `/v1/cities`, `/v1/cities/:slug/shops`
- **Shops**: `/v1/shops/register`, `/v1/shops/me`, `/v1/shops/:id`
- **Products**: `/v1/products/:id`, `/v1/cities/:slug/products`, `/v1/search`
- **Leads**: `/v1/products/:id/lead`, `/v1/shops/:shopId/leads`
- **Payments**: `/v1/shops/:id/membership/checkout`, `/v1/payments/webhook`
- **Admin**: `/v1/admin/shops`, `/v1/admin/transactions`, `/v1/admin/stats`
- **Health**: `/health`, `/health/ready`

## 🧪 Testing

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## 🐳 Docker Deployment

```bash
docker build -t jewelia-backend:latest .
docker run -p 3000:3000 jewelia-backend:latest
```

## ☸️ Kubernetes Deployment

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
```

## 🗄️ Database Management

```bash
npm run prisma:studio  # View database
npm run prisma:migrate # Create migration
```

## 🔐 Default Credentials

**Admin**: `admin@jewelia.com` / `admin123`  
**Shop Owner**: `rajesh@example.com` / `owner123`

⚠️ Change these in production!

## 📝 License

UNLICENSED - Private Project

## 👥 Contributors

Design Arena Founders (founders@designarena.ai)

---

Built with ❤️ for JEWELIA - Connecting Jewelry Shops with Customers
