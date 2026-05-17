import type { ReviewInput } from "@doorspeaks/shared";
import {
  landlords as seededLandlords,
  rightsGuides,
  reviews as seededReviews,
  rentData
} from "@doorspeaks/shared/testData";

export type StoredReview = ReviewInput & {
  id: string;
  createdAt: string;
  status: "PENDING" | "PUBLISHED";
};

export type UserRole = "TENANT" | "CUSTOMER";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  token: string;
  userId: string;
  createdAt: string;
};

export type ToletRecord = {
  id: string;
  title: string;
  locality: string;
  ward: string;
  city: string;
  bhk: "1BHK" | "2BHK" | "3BHK";
  furnishing: "UNFURNISHED" | "SEMI" | "FULLY";
  monthlyRent: number;
  deposit: number;
  photoUrl: string;
  description: string;
  postedBy: string;
  createdAt: string;
};

export const landlords = seededLandlords;

export const reviews: StoredReview[] = seededReviews.map((review) => ({
  ...review,
  createdAt: review.publishedAt,
  status: "PUBLISHED"
}));

export const seededRentData = rentData;
export const seededRightsGuides = rightsGuides;

const defaultPhotos = [
  "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
];

export const users: UserRecord[] = [];
export const sessions: AuthSession[] = [];

export const tolets: ToletRecord[] = seededRentData.slice(0, 6).map((point, index) => {
  const owner = landlords.find((landlord) => landlord.locality === point.locality);

  return {
    id: `tl-${index + 1}`,
    title: `${point.bhk} in ${point.locality}`,
    locality: point.locality,
    ward: point.ward,
    city: point.city,
    bhk: point.bhk,
    furnishing: point.furnishing,
    monthlyRent: point.monthlyRent,
    deposit: point.depositPaid,
    photoUrl: defaultPhotos[index % defaultPhotos.length] ?? defaultPhotos[0] ?? "",
    description: "Well-maintained rental with practical commute options and clear paperwork expectations.",
    postedBy: owner?.name ?? "Verified owner",
    createdAt: new Date().toISOString()
  };
});
