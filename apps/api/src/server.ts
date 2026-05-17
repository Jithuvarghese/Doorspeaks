import { config as loadEnv } from "dotenv";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { depositCheckSchema, reviewInputSchema } from "@doorspeaks/shared";
import { z } from "zod";
import {
  landlords,
  reviews,
  seededRentData,
  seededRightsGuides,
  sessions,
  tolets,
  users,
  type UserRecord,
  type UserRole
} from "./data.js";

loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const app = Fastify({ logger: true });

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TENANT", "CUSTOMER"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const toletCreateSchema = z.object({
  title: z.string().min(4),
  locality: z.string().min(2),
  ward: z.string().min(2),
  city: z.string().min(2),
  bhk: z.enum(["1BHK", "2BHK", "3BHK"]),
  furnishing: z.enum(["UNFURNISHED", "SEMI", "FULLY"]),
  monthlyRent: z.number().int().positive(),
  deposit: z.number().int().nonnegative(),
  photoUrl: z.string().url(),
  description: z.string().min(20)
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const hash = hashPassword(password, salt);
  const current = Buffer.from(hash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (current.length !== expected.length) return false;
  return timingSafeEqual(current, expected);
}

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function getAuthUser(request: { headers: Record<string, string | string[] | undefined> }, allowedRoles?: UserRole[]) {
  const authorization = request.headers.authorization;
  const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!headerValue || !headerValue.startsWith("Bearer ")) return null;

  const token = headerValue.slice("Bearer ".length).trim();
  const session = sessions.find((entry) => entry.token === token);
  if (!session) return null;

  const user = users.find((entry) => entry.id === session.userId);
  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;
  return { user, token };
}

await app.register(cors, {
  origin: true
});

app.get("/health", async () => ({ status: "ok" }));

app.post("/api/auth/register", async (request, reply) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: "Invalid registration payload",
      issues: parsed.error.issues
    });
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = users.find((entry) => entry.email === email);

  if (existing) {
    return reply.status(409).send({ message: "An account with this email already exists." });
  }

  const salt = randomBytes(16).toString("hex");
  const user = {
    id: `usr-${users.length + 1}`,
    name: parsed.data.name.trim(),
    email,
    role: parsed.data.role,
    passwordSalt: salt,
    passwordHash: hashPassword(parsed.data.password, salt),
    createdAt: new Date().toISOString()
  } satisfies UserRecord;

  users.push(user);

  const token = randomUUID().replace(/-/g, "") + randomBytes(12).toString("hex");
  sessions.push({ id: `ses-${sessions.length + 1}`, token, userId: user.id, createdAt: new Date().toISOString() });

  return reply.status(201).send({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/login", async (request, reply) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: "Invalid login payload",
      issues: parsed.error.issues
    });
  }

  const email = normalizeEmail(parsed.data.email);
  const user = users.find((entry) => entry.email === email);

  if (!user || !verifyPassword(parsed.data.password, user.passwordSalt, user.passwordHash)) {
    return reply.status(401).send({ message: "Invalid email or password." });
  }

  const token = randomUUID().replace(/-/g, "") + randomBytes(12).toString("hex");
  sessions.push({ id: `ses-${sessions.length + 1}`, token, userId: user.id, createdAt: new Date().toISOString() });

  return reply.send({ token, user: sanitizeUser(user) });
});

app.get("/api/auth/me", async (request, reply) => {
  const auth = getAuthUser(request);

  if (!auth) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  return reply.send({ user: sanitizeUser(auth.user) });
});

app.post("/api/auth/logout", async (request, reply) => {
  const auth = getAuthUser(request);

  if (!auth) return reply.send({ ok: true });

  const index = sessions.findIndex((entry) => entry.token === auth.token);
  if (index >= 0) sessions.splice(index, 1);

  return reply.send({ ok: true });
});

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
  rightsGuides: seededRightsGuides,
  tolets
}));

app.get("/api/tolets", async () => ({
  results: [...tolets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}));

app.post("/api/tolets", async (request, reply) => {
  const auth = getAuthUser(request, ["TENANT"]);

  if (!auth) {
    return reply.status(403).send({ message: "Only logged in tenants can post to-let listings." });
  }

  const parsed = toletCreateSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: "Invalid to-let payload",
      issues: parsed.error.issues
    });
  }

  const listing = {
    id: `tl-${tolets.length + 1}`,
    ...parsed.data,
    postedBy: auth.user.name,
    createdAt: new Date().toISOString()
  };

  tolets.push(listing);

  return reply.status(201).send({ message: "To-let listing posted.", listing });
});

app.post("/api/reviews", async (request, reply) => {
  const auth = getAuthUser(request, ["CUSTOMER"]);

  if (!auth) {
    return reply.status(403).send({ message: "Only logged in customers can submit reviews." });
  }

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
