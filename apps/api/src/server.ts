import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { depositCheckSchema, reviewInputSchema } from "@doorspeaks/shared";
import { landlords, reviews, seededRentData, seededRightsGuides } from "./data.js";

loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

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

app.get("/api/test-data", async () => ({
  landlords,
  reviews,
  rentData: seededRentData,
  rightsGuides: seededRightsGuides
}));

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
  guides: seededRightsGuides
}));

app.post("/api/chat", async (request, reply) => {
  const body = request.body as { message?: string; history?: Array<{ role: string; text: string }> };
  const message = body.message?.trim();

  if (!message) {
    return reply.status(400).send({ message: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return reply.status(500).send({
      message: "Gemini is not configured. Set GEMINI_API_KEY in apps/api/.env or your environment."
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const conversation = [
      ...(body.history ?? []).map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`),
      `User: ${message}`
    ].join("\n");

    const response = await ai.models.generateContent({
      model,
      contents: conversation,
      config: {
        systemInstruction:
          "You are DoorSpeaks Assistant, a tenant-first rental guide for Bangalore. Be concise, practical, and clear. Do not invent laws. If legal advice is requested, encourage the user to verify with local counsel or official sources.",
        temperature: 0.4,
        maxOutputTokens: 500
      }
    });

    return {
      reply: response.text?.trim() || "I could not generate a response right now. Please try again."
    };
  } catch (error) {
    request.log.error({ error }, "Gemini request failed before receiving a response");

    const errorText = error instanceof Error ? error.message : String(error);

    if (errorText.includes("API key not valid") || errorText.includes("API_KEY_INVALID")) {
      return reply.send({
        reply:
          "Gemini API key is invalid or expired. Replace GEMINI_API_KEY in apps/api/.env with a valid key from AI Studio and try again."
      });
    }

    return reply.send({
      reply:
        "The assistant is temporarily unavailable. Check that GEMINI_API_KEY is set correctly in apps/api/.env and try again."
    });
  }
});

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
