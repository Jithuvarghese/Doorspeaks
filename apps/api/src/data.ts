import type { Landlord, ReviewInput } from "@doorspeaks/shared";

export const landlords: Landlord[] = [
  { id: "ll-001", name: "A. Srinivas", locality: "HSR Layout", avgRating: 4.1, reviewCount: 18 },
  { id: "ll-002", name: "Meera Properties", locality: "Koramangala", avgRating: 2.7, reviewCount: 31 },
  { id: "ll-003", name: "R. Natarajan", locality: "Whitefield", avgRating: 3.6, reviewCount: 12 },
  { id: "ll-004", name: "Sree Rentals", locality: "Marathahalli", avgRating: 3.1, reviewCount: 9 }
];

export type StoredReview = ReviewInput & {
  id: string;
  createdAt: string;
  status: "PENDING" | "PUBLISHED";
};

export const reviews: StoredReview[] = [];

export const rightsGuides = [
  {
    id: "deposit-return",
    title: "My landlord is not returning my deposit",
    summary: "Send a written demand first, attach rent receipts, and cite Karnataka deposit limits.",
    language: ["English", "Kannada", "Hindi"]
  },
  {
    id: "privacy-entry",
    title: "My landlord entered without notice",
    summary: "Document incidents with date and time, send a notice asserting privacy rights.",
    language: ["English", "Kannada", "Hindi"]
  },
  {
    id: "utility-threat",
    title: "My landlord threatened to cut water or power",
    summary: "Utility disconnection as coercion is challengeable. Preserve messages and file complaint.",
    language: ["English", "Kannada", "Hindi"]
  }
];
