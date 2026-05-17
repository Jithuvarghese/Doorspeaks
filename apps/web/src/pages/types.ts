import type { Landlord, ReviewInput } from "@doorspeaks/shared";

export type TestDataPayload = {
  landlords: Landlord[];
  reviews: Array<ReviewInput & { id: string; landlordName: string; publishedAt: string; status: "PUBLISHED" }>;
  rentData: Array<{
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
  }>;
  rightsGuides: Array<{ id: string; title: string; summary: string; language: string[] }>;
};

export type PageId = "dashboard" | "landlords" | "reviews" | "tolet";
