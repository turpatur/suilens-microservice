# Suilens Microservices - Startup Guide

## One-Command Startup

To start the entire system (all services, databases, RabbitMQ, and frontend) with automatic migrations and seed data:

```bash
docker compose up --build -d
```

This single command will:
- Build all service images
- Start all PostgreSQL databases
- Start RabbitMQ message broker
- Run database migrations for all services
- Seed initial data (lenses and inventory across branches)
- Start all microservices (Catalog, Order, Inventory, Notification)
- Start the Vue.js frontend

## What Gets Seeded

### Catalog Service
The following lenses are automatically seeded:
1. **Summilux-M 35mm f/1.4 ASPH.** (Leica) - 450,000 IDR/day
2. **Art 24-70mm f/2.8 DG DN** (Sigma) - 200,000 IDR/day
3. **NIKKOR Z 70-200mm f/2.8 VR S** (Nikon) - 350,000 IDR/day

### Inventory Service
Three branches are seeded with 5 units of stock each for all lenses:
- **KB-JKT-S** - Komet Biru Jakarta Selatan
- **KB-JKT-E** - Komet Biru Jakarta Timur
- **KB-JKT-N** - Komet Biru Jakarta Utara

## Service Endpoints

After startup, access:
- **Frontend**: http://localhost:5173
- **Catalog API**: http://localhost:3001
- **Order API**: http://localhost:3002
- **Inventory API**: http://localhost:3004
- **RabbitMQ Management**: http://localhost:15672 (guest:guest)

## Database Access

```bash
# Catalog
psql -h localhost -p 5433 -U catalog -d catalog

# Order
psql -h localhost -p 5434 -U orders -d orders

# Inventory
psql -h localhost -p 5436 -U inventory -d inventory

# Notifications
psql -h localhost -p 5435 -U notifications -d notifications
```

## Stop All Services

```bash
docker compose down
```

## Reset & Rebuild

To completely reset (remove volumes and rebuild):

```bash
docker compose down -v
docker compose up --build -d
```

## Troubleshooting

If services don't start properly:
1. Check logs: `docker compose logs service-name`
2. Verify all ports are available (5173, 3001-3004, 5433-5436, 5672, 15672)
3. Ensure Docker and Docker Compose are installed and running

## Architecture

The system uses:
- **Vue 3** frontend with Vuetify and TailwindCSS
- **Elysia** framework for Node.js microservices
- **PostgreSQL** for persistent data
- **RabbitMQ** for async event messaging (order.cancelled events)
- **Drizzle ORM** for type-safe database queries
