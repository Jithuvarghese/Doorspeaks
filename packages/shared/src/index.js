import { z } from "zod";
export const ratingSchema = z.number().int().min(1).max(5);
export const landlordSchema = z.object({
    id: z.string(),
    name: z.string(),
    locality: z.string(),
    avgRating: z.number(),
    reviewCount: z.number().int().nonnegative()
});
export const reviewInputSchema = z.object({
    landlordId: z.string().min(1),
    reviewerType: z.enum(["IT_PROFESSIONAL", "STUDENT", "WORKING_MIGRANT", "OTHER"]),
    locality: z.string().min(2),
    bhk: z.enum(["1BHK", "2BHK", "3BHK", "4BHK+"]),
    body: z.string().min(100),
    depositReturned: z.enum(["FULL", "PARTIAL", "NONE", "ONGOING"]),
    ratings: z.object({
        fairness: ratingSchema,
        communication: ratingSchema,
        maintenance: ratingSchema,
        depositHandling: ratingSchema,
        privacy: ratingSchema
    }),
    tags: z.array(z.string().min(2)).max(8)
});
export const depositCheckSchema = z.object({
    monthlyRent: z.number().int().positive(),
    landlordDemand: z.number().int().nonnegative().optional()
});
