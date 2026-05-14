import type { Landlord, ReviewInput } from "./index";

export type ReviewRecord = ReviewInput & {
  id: string;
  landlordName: string;
  publishedAt: string;
  status: "PUBLISHED";
};

export type RentDataPoint = {
  id: string;
  locality: string;
  ward: string;
  city: string;
  bhk: "1BHK" | "2BHK" | "3BHK";
  furnishing: "UNFURNISHED" | "SEMI" | "FULLY";
  monthlyRent: number;
  depositPaid: number;
  reportedMonth: string;
  verifiedByReceipt: boolean;
};

export const landlords: Landlord[] = [
  { id: "ll-001", name: "A. Srinivas", locality: "HSR Layout", avgRating: 4.1, reviewCount: 18 },
  { id: "ll-002", name: "Meera Properties", locality: "Koramangala", avgRating: 2.7, reviewCount: 31 },
  { id: "ll-003", name: "R. Natarajan", locality: "Whitefield", avgRating: 3.6, reviewCount: 12 },
  { id: "ll-004", name: "Sree Rentals", locality: "Marathahalli", avgRating: 3.1, reviewCount: 9 },
  { id: "ll-005", name: "Lakshmi Estates", locality: "Bellandur", avgRating: 4.4, reviewCount: 24 },
  { id: "ll-006", name: "Ganesh House Owners", locality: "Indiranagar", avgRating: 3.8, reviewCount: 15 },
  { id: "ll-007", name: "Cedar Homes", locality: "Jayanagar", avgRating: 4.6, reviewCount: 19 },
  { id: "ll-008", name: "BlueBrick Rentals", locality: "Electronic City", avgRating: 2.9, reviewCount: 27 },
  { id: "ll-009", name: "Urban Nest", locality: "BTM Layout", avgRating: 3.9, reviewCount: 14 }
];

export const reviews: ReviewRecord[] = [
  {
    id: "rv-101",
    landlordId: "ll-001",
    landlordName: "A. Srinivas",
    reviewerType: "IT_PROFESSIONAL",
    locality: "HSR Layout",
    bhk: "2BHK",
    body:
      "The apartment itself was fine, but the deposit return process was slow and only partially returned after repeated follow-ups. Maintenance was handled, but privacy boundaries were weak because of surprise visits without much notice.",
    depositReturned: "PARTIAL",
    ratings: { fairness: 3, communication: 3, maintenance: 4, depositHandling: 2, privacy: 2 },
    tags: ["Deposit demanded", "Surprise visits", "Maintenance responsive"],
    publishedAt: "2026-04-10T09:30:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-102",
    landlordId: "ll-002",
    landlordName: "Meera Properties",
    reviewerType: "STUDENT",
    locality: "Koramangala",
    bhk: "1BHK",
    body:
      "The landlord escalated rent every year and kept changing informal rules after the agreement was signed. Deposit was returned only after a long delay and with deductions that were not explained properly.",
    depositReturned: "NONE",
    ratings: { fairness: 2, communication: 2, maintenance: 3, depositHandling: 1, privacy: 2 },
    tags: ["Rent escalation", "Deposit withheld", "Unclear rules"],
    publishedAt: "2026-04-21T14:00:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-103",
    landlordId: "ll-005",
    landlordName: "Lakshmi Estates",
    reviewerType: "WORKING_MIGRANT",
    locality: "Bellandur",
    bhk: "3BHK",
    body:
      "Straightforward landlord, written communication was respected, and all maintenance requests were answered within a day. The move-out deposit was returned fully after a documented handover.",
    depositReturned: "FULL",
    ratings: { fairness: 5, communication: 5, maintenance: 4, depositHandling: 5, privacy: 5 },
    tags: ["Deposit returned", "Responsive", "Written notices respected"],
    publishedAt: "2026-05-02T11:15:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-104",
    landlordId: "ll-006",
    landlordName: "Ganesh House Owners",
    reviewerType: "IT_PROFESSIONAL",
    locality: "Indiranagar",
    bhk: "2BHK",
    body:
      "Monthly maintenance was mostly fine, but utility threats were used during a dispute and there was pressure to vacate before the full notice period. Keep everything in writing.",
    depositReturned: "ONGOING",
    ratings: { fairness: 2, communication: 2, maintenance: 3, depositHandling: 2, privacy: 1 },
    tags: ["Utility threats", "Notice dispute", "Keep written proof"],
    publishedAt: "2026-05-08T17:45:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-105",
    landlordId: "ll-007",
    landlordName: "Cedar Homes",
    reviewerType: "STUDENT",
    locality: "Jayanagar",
    bhk: "1BHK",
    body:
      "Clean communication, clear maintenance process, and the deposit was settled on time. The agreement matched what was discussed before move-in.",
    depositReturned: "FULL",
    ratings: { fairness: 5, communication: 5, maintenance: 4, depositHandling: 5, privacy: 5 },
    tags: ["Deposit returned", "Clear agreement", "Responsive"],
    publishedAt: "2026-05-11T12:20:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-106",
    landlordId: "ll-008",
    landlordName: "BlueBrick Rentals",
    reviewerType: "WORKING_MIGRANT",
    locality: "Electronic City",
    bhk: "2BHK",
    body:
      "The property itself was okay, but deposit deductions were vague and the communication style was informal when issues came up. Keep every payment receipt and message.",
    depositReturned: "PARTIAL",
    ratings: { fairness: 2, communication: 2, maintenance: 3, depositHandling: 2, privacy: 3 },
    tags: ["Deposit deductions", "Keep receipts", "Informal communication"],
    publishedAt: "2026-05-13T09:10:00.000Z",
    status: "PUBLISHED"
  },
  {
    id: "rv-107",
    landlordId: "ll-009",
    landlordName: "Urban Nest",
    reviewerType: "IT_PROFESSIONAL",
    locality: "BTM Layout",
    bhk: "3BHK",
    body:
      "Most concerns were minor and the landlord stayed within the agreement terms. Good written updates and decent privacy boundaries made the stay predictable.",
    depositReturned: "FULL",
    ratings: { fairness: 4, communication: 4, maintenance: 4, depositHandling: 4, privacy: 4 },
    tags: ["Predictable", "Written updates", "Privacy respected"],
    publishedAt: "2026-05-14T07:30:00.000Z",
    status: "PUBLISHED"
  }
];

export const rentData: RentDataPoint[] = [
  {
    id: "rent-001",
    locality: "HSR Layout",
    ward: "Bommanahalli",
    city: "Bengaluru",
    bhk: "2BHK",
    furnishing: "SEMI",
    monthlyRent: 38000,
    depositPaid: 76000,
    reportedMonth: "2026-03-01",
    verifiedByReceipt: true
  },
  {
    id: "rent-002",
    locality: "Koramangala",
    ward: "South",
    city: "Bengaluru",
    bhk: "1BHK",
    furnishing: "FULLY",
    monthlyRent: 31000,
    depositPaid: 62000,
    reportedMonth: "2026-03-01",
    verifiedByReceipt: true
  },
  {
    id: "rent-003",
    locality: "Whitefield",
    ward: "Mahadevapura",
    city: "Bengaluru",
    bhk: "3BHK",
    furnishing: "SEMI",
    monthlyRent: 52000,
    depositPaid: 100000,
    reportedMonth: "2026-04-01",
    verifiedByReceipt: true
  },
  {
    id: "rent-004",
    locality: "Bellandur",
    ward: "Sarjapur",
    city: "Bengaluru",
    bhk: "2BHK",
    furnishing: "UNFURNISHED",
    monthlyRent: 35000,
    depositPaid: 50000,
    reportedMonth: "2026-04-01",
    verifiedByReceipt: false
  },
  {
    id: "rent-005",
    locality: "Jayanagar",
    ward: "South",
    city: "Bengaluru",
    bhk: "1BHK",
    furnishing: "SEMI",
    monthlyRent: 28000,
    depositPaid: 56000,
    reportedMonth: "2026-05-01",
    verifiedByReceipt: true
  },
  {
    id: "rent-006",
    locality: "BTM Layout",
    ward: "Bommanahalli",
    city: "Bengaluru",
    bhk: "3BHK",
    furnishing: "FULLY",
    monthlyRent: 46000,
    depositPaid: 92000,
    reportedMonth: "2026-05-01",
    verifiedByReceipt: true
  },
  {
    id: "rent-007",
    locality: "Electronic City",
    ward: "South East",
    city: "Bengaluru",
    bhk: "2BHK",
    furnishing: "SEMI",
    monthlyRent: 30000,
    depositPaid: 60000,
    reportedMonth: "2026-05-01",
    verifiedByReceipt: false
  }
];

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
  },
  {
    id: "rent-hike",
    title: "My landlord is demanding an unusual rent hike",
    summary: "Compare the request with local trends and ask for a written revision before agreeing.",
    language: ["English", "Kannada", "Hindi"]
  },
  {
    id: "surprise-entry",
    title: "My landlord keeps visiting without notice",
    summary: "Set a written boundary and document every visit with date, time, and message proof.",
    language: ["English", "Kannada", "Hindi"]
  },
  {
    id: "repair-delay",
    title: "Repairs are being ignored for weeks",
    summary: "Ask for a formal timeline and record the gap between request and action.",
    language: ["English", "Kannada", "Hindi"]
  }
];
