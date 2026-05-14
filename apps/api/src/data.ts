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

export const landlords = seededLandlords;

export const reviews: StoredReview[] = seededReviews.map((review) => ({
  ...review,
  createdAt: review.publishedAt,
  status: "PUBLISHED"
}));

export const seededRentData = rentData;
export const seededRightsGuides = rightsGuides;
