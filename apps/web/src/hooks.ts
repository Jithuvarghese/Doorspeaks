import { useEffect, useState } from "react";
import type { Landlord, ReviewInput } from "@doorspeaks/shared";

type RentDataPoint = {
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

type RightsGuide = {
  id: string;
  title: string;
  summary: string;
  language: string[];
};

type ReviewRecord = ReviewInput & {
  id: string;
  landlordName: string;
  publishedAt: string;
  status: "PUBLISHED";
};

type TestDataPayload = {
  landlords: Landlord[];
  reviews: ReviewRecord[];
  rentData: RentDataPoint[];
  rightsGuides: RightsGuide[];
};

export function useTestData() {
  const [data, setData] = useState<TestDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/test-data");
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const payload = (await response.json()) as TestDataPayload;
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
