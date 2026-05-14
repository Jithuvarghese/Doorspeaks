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

## Gemini chat setup

The AI chat page uses the Gemini API through the Fastify backend. You need:

- `GEMINI_API_KEY`: create this in Google AI Studio / Gemini API and keep it in `apps/api/.env`
- `GEMINI_MODEL`: optional, defaults to `gemini-1.5-flash`

Put the values in `apps/api/.env` like this:

```bash
PORT=4000
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

The backend route is `POST /api/chat`, and the frontend chat page is `AI chat` in the main menu.

## Product direction

DoorSpeaks is designed like Glassdoor for landlords and rental properties, centered on tenant trust, legal clarity, and transparent rental data.
