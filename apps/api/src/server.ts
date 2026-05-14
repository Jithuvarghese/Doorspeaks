import Fastify from "fastify";
import cors from "@fastify/cors";
import { depositCheckSchema, reviewInputSchema } from "@doorspeaks/shared";
import { landlords, reviews, rightsGuides } from "./data.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

app.get("/health", async () => ({ status: "ok" }));

app.get("/api/landlords", async (request, reply) => {
  const query = (request.query as { q?: string }).q?.toLowerCase().trim();

  if (!query) {
    return { results: landlords };
  }

  const filtered = landlords.filter((landlord) => {
    return (
      landlord.name.toLowerCase().includes(query) ||
      landlord.locality.toLowerCase().includes(query)
    );
  });

  return { results: filtered };
});

app.post("/api/reviews", async (request, reply) => {
  const parsed = reviewInputSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: "Invalid review payload",
      issues: parsed.error.issues
    });
  }

  const review = {
    id: `rv-${reviews.length + 1}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "PENDING" as const
  };

  reviews.push(review);

  return reply.status(201).send({
    message: "Review submitted for moderation",
    reviewId: review.id
  });
});

app.post("/api/deposit-check", async (request, reply) => {
  const parsed = depositCheckSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: "Invalid deposit check payload",
      issues: parsed.error.issues
    });
  }

  const legalMax = parsed.data.monthlyRent * 2;
  const demanded = parsed.data.landlordDemand ?? legalMax;
  const difference = demanded - legalMax;

  return {
    monthlyRent: parsed.data.monthlyRent,
    legalMax,
    landlordDemand: demanded,
    overLimit: difference > 0,
    difference,
    legalReference: "Karnataka tenancy deposit guidance (2 months maximum for residential tenancy)",
    nextStepTemplate:
      difference > 0
        ? "Your requested deposit exceeds the legal cap. Please revise to the lawful maximum of two months' rent."
        : "The requested deposit is within the legal cap. Keep payment proof and mention refund terms in the agreement."
  };
});

app.get("/api/rights", async () => ({
  guides: rightsGuides
}));

const port = Number(process.env.PORT || 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`DoorSpeaks API listening on ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
