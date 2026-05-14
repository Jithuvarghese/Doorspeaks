# DoorSpeaks - Full Product Specification

Bangalore's Tenant-First Rental Transparency Platform

## 1. Product Vision

DoorSpeaks is India's tenant-first rental platform, built for Bangalore renters facing opaque pricing, illegal deposit demands, and weak recourse after signing agreements.

Think Glassdoor for landlords and rental properties. The platform gives tenants verified reviews, rent intelligence, legal guidance, and agreement risk scanning. Landlords can participate, but trust and decision power remain tenant-first.

Tagline: Know before you sign.

## 2. Target Users

### Primary - Tenants

- IT professionals relocating to Bangalore
- First-time college renters
- Working migrants from North Karnataka, Tamil Nadu, and Andhra Pradesh
- Tenants who want to report unfair landlord behavior

### Secondary - Landlords

- Good-faith landlords who want better tenant fit
- Property managers handling multiple units
- Owners seeking transparent market benchmarks

## 3. Core Features

### 3.1 Landlord Review System (Glassdoor model)

- Verified review flow using agreement upload (address + dates)
- Public anonymity with internal verification
- Review unlock after move-out to reduce retaliation risk
- Structured tags:
  - Deposit demanded
  - Deposit returned (full/partial/none)
  - Maintenance responsiveness
  - Privacy respect
  - Surprise visits
  - Utility cut threats
  - Rent escalation behavior
- 5 dimension ratings:
  - Fairness
  - Communication
  - Maintenance
  - Deposit handling
  - Privacy
- Photo uploads (move-in, move-out, receipts, damage evidence)
- Landlord responses on reviews
- Helpful / not helpful voting
- Verified badge for registered landlord/property profiles

### 3.2 Rent Transparency Map

- Crowdsourced actual paid rent with receipt verification
- Asking price vs paid price comparison
- Filters: locality, BHK, furnishing, year, floor
- Monthly locality trend lines (HSR, Koramangala, Whitefield, etc.)
- Percentile intelligence (example: paying more than 73% of similar units)

### 3.3 Deposit Legality Checker

- Input monthly rent
- Output legal cap (Karnataka: 2 months, 2025 rules)
- Compare requested deposit vs legal cap
- Provide law citation + negotiation template
- Tribunal filing links
- Languages: English, Kannada, Hindi

### 3.4 Agreement Red-Flag Scanner

- PDF upload
- Clause analysis for illegal or risky terms
- Traffic-light report:
  - Green: compliant
  - Amber: questionable
  - Red: illegal / likely unenforceable
- Plain-language explanation per clause
- Counter-clause suggestions for negotiation

### 3.5 Tenant Rights Hub

- Plain-language Karnataka law guidance
- Scenario playbooks:
  - Deposit not returned
  - Landlord entry without notice
  - Utility cut threats
- WhatsApp-shareable legal notice templates
- Kannada + Hindi support

### 3.6 Landlord Listings (secondary)

- Landlord listing flow with photos, rent, deposit
- Review score shown prominently
- Reviews cannot be suppressed
- Verified listing badge
- Direct contact without mandatory broker intermediation

### 3.7 Rent Payment Tracker

- Monthly payment logs
- Renewal reminders
- Move-out deposit refund countdown

## 4. Tech Stack

### Frontend

- React 18 + TypeScript
- Vite 5
- TanStack Router (file-based, type-safe)
- Zustand + TanStack Query v5
- shadcn/ui + Radix + custom design system
- Tailwind CSS v4 + CSS variables
- Framer Motion
- Mapbox GL JS
- Recharts
- React Hook Form + Zod
- React Dropzone
- Tiptap
- Lucide React
- date-fns
- i18next
- PDF.js

### Backend

- Node.js 20 LTS
- Fastify
- REST + tRPC
- Passport.js + JWT + refresh rotation
- Prisma
- Shared Zod schemas
- AWS S3 + presigned URLs
- pdf-parse + custom NLP layer
- OpenAI API for agreement analysis
- Resend
- Twilio / Gupshup

### Database and Search

- PostgreSQL 16 (RDS)
- Redis 7 (ElastiCache)
- Elasticsearch / OpenSearch

### Messaging and Events

- Kafka (Confluent Cloud or self-hosted)
- Topics:
  - review.submitted
  - review.verified
  - agreement.uploaded
  - rent.reported
  - user.flagged
  - notification.send

### Infrastructure and DevOps

- Docker (multi-stage)
- Kubernetes on AWS EKS
- HPA + KEDA
- ConfigMaps + Secrets
- nginx Ingress + cert-manager
- Namespace isolation (dev, staging, prod)
- GitHub Actions + Argo Rollouts
- Prometheus + Grafana
- ELK stack
- CloudFront + Route 53

## 5. Design System and UI

### Aesthetic direction

Editorial trust: investigative-news authority + modern legal clarity.

- Primary mood: dark navy credibility
- Accent mood: warm amber urgency
- Tone: serious, tenant-empowering

### Typography

- Display: Playfair Display
- Body: DM Sans
- Mono/data: JetBrains Mono

### Colors

```css
:root {
  --color-navy: #0F1B2D;
  --color-navy-light: #1A2C44;
  --color-navy-border: #253D5B;

  --color-amber: #F4A800;
  --color-amber-soft: #FFF3CC;

  --color-red: #E24B4A;
  --color-amber-warn: #F59E0B;
  --color-green: #22C55E;

  --color-text-primary: #F0F4F8;
  --color-text-secondary: #94A3B8;
  --color-text-tertiary: #4A6080;

  --color-surface: #FFFFFF;
  --color-surface-2: #F8FAFC;
  --color-border: #E2E8F0;
}
```

### Primary pages

- / (Landing)
- /landlord/[id]
- /reviews/new
- /rights
- /map
- /agreement-scan
- /landlord/register
- /dashboard

## 6. Core Data Model

Tables:

- users
- landlords
- properties
- tenancies
- reviews
- review_photos
- landlord_responses
- rent_data
- agreement_scans

Key constraints:

- One review per verified tenancy
- Review publication governed by moderation state
- Strong ties between tenancy verification and review credibility

## 7. Redis Usage Patterns

- session:{userId}
- locality:rent:stats:{locality}:{bhk}
- landlord:profile:{landlordId}
- ward:rent:heatmap
- ratelimit:review:submit:{userId}
- ratelimit:agreement:scan:{userId}
- ratelimit:api:{ip}
- trending:landlords:week
- trending:localities:month
- deposit:legal:max:{state}

## 8. Kafka Topics and Consumers

- review.submitted -> moderation + notifications
- review.approved -> profile recalculation + notifications + analytics
- agreement.uploaded -> scanner worker + notifications
- rent.reported -> rent aggregates + analytics
- user.suspicious -> moderation escalation + admin notifications
- notification.send -> email/SMS/push fan-out

## 9. Kubernetes Deployment Outline

- Namespaces: dev, staging, production
- Deployments:
  - doorspeaks-api
  - doorspeaks-worker
  - doorspeaks-frontend
- Ingress + TLS
- Secret management through external secrets
- Autoscaling policy for API and workers

## 10. CI/CD Pipeline

GitHub Actions flow:

- PR checks:
  - lint
  - typecheck
  - unit tests
  - integration tests
- Main branch:
  - build and push images
  - image security scan
  - deploy to staging
  - smoke tests
- Release tags:
  - canary rollout to production
  - automated rollback on error spikes

## 11. Moderation and Anti-Gaming

Defenses include:

- Agreement-based tenancy verification
- One-review-per-tenancy rule
- Delayed review unlock after tenancy end
- Rate limiting and suspicious activity detection
- Human moderation queue for flagged cases

## 12. Revenue Model

- Tenant Pro subscription: INR 99/month
- One-time agreement scan: INR 49
- Verified landlord listing: INR 499/month
- Legal referral fee model
- B2B anonymized data reports
- NGO/government rights-data partnerships

## 13. Launch Strategy

### Phase 1 (Weeks 1-4)

- No-code validation
- Collect initial demand signal

### Phase 2 (Months 1-3)

- MVP: landlord search, reviews, deposit checker, static rights hub

### Phase 3 (Months 3-6)

- Agreement scanner, heatmap, async event pipeline, landlord accounts, Kannada support

### Phase 4 (Months 6-12)

- Scale architecture for 10k+ DAU
- Multi-city expansion

## 14. Portfolio Skills Demonstrated

- React 18 + TypeScript
- Modern state/data stack
- Responsive product design
- Redis caching and rate limiting
- Kafka event architecture
- Docker and Kubernetes operations
- PostgreSQL modeling and search
- CI/CD and release safety
- Security and trust workflows

## 15. AI Design Prompt Template

Use this reusable generation prompt for future components:

```text
You are building DoorSpeaks - a tenant-first rental transparency platform for
Bangalore. Think Glassdoor but for landlords.

Design language: Editorial trust - serious, credible, empowering.
Primary palette: Deep navy (#0F1B2D) + warm amber (#F4A800) accents.
Typography: Playfair Display (headings) + DM Sans (body) + JetBrains Mono (data).
Always mobile-first. Always accessible (WCAG AA).

Stack: React 18 + TypeScript + Vite + TanStack Router + Zustand + TanStack Query v5
+ shadcn/ui + Tailwind CSS v4 + Framer Motion + Mapbox GL JS + Recharts.

The platform stands for tenants. Every design decision should make tenants feel
informed, protected, and empowered. Landlord features exist but are secondary.

Build [COMPONENT/PAGE NAME] with the following requirements:
[YOUR REQUIREMENTS HERE]
```

DoorSpeaks is built for every tenant who lost their deposit and had no one in their corner.
