# DoorSpeaks

DoorSpeaks is Bangalore's tenant-first rental transparency platform.

Tagline: Know before you sign.

## Repository layout

- `docs/PRODUCT_SPEC.md`: Full product vision, architecture, and roadmap
- `apps/web`: React + TypeScript frontend MVP
- `apps/api`: Fastify + TypeScript backend MVP
- `packages/shared`: Shared Zod schemas and TypeScript types

## Phase 2 MVP included here

- Landlord search API + UI
- Review submission API + UI
- Deposit legality checker API + UI
- Tenant rights hub API + UI

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Run backend

```bash
npm run dev:api
```

API runs on `http://localhost:4000`.

### 3. Run frontend (new terminal)

```bash
npm run dev:web
```

Web app runs on `http://localhost:5173`.

## Product direction

DoorSpeaks is designed like Glassdoor for landlords and rental properties, centered on tenant trust, legal clarity, and transparent rental data.
