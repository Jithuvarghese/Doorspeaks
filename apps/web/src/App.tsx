import { FormEvent, useMemo, useState } from "react";
import type { ReviewInput } from "@doorspeaks/shared";
import { useTestData } from "./hooks";
import { LandlordCard } from "./components/LandlordCard";
import { ReviewCard } from "./components/ReviewCard";
import { RentTrendCard } from "./components/RentTrendCard";

const API_BASE = "http://localhost:4000";

type DepositResult = {
  monthlyRent: number;
  legalMax: number;
  landlordDemand: number;
  overLimit: boolean;
  difference: number;
  legalReference: string;
  nextStepTemplate: string;
};

export function App() {
  const { data: testData, loading: dataLoading, error: dataError } = useTestData();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [rent, setRent] = useState("");
  const [demand, setDemand] = useState("");
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

  const [reviewBody, setReviewBody] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Write at least 100 characters and submit for moderation.");

  const reviewLength = useMemo(() => reviewBody.trim().length, [reviewBody]);

  function handleLandlordSearch(event: FormEvent) {
    event.preventDefault();
    if (!testData) return;

    const q = query.toLowerCase().trim();
    const results = testData.landlords.filter(
      (landlord) =>
        landlord.name.toLowerCase().includes(q) || landlord.locality.toLowerCase().includes(q)
    );

    setSearchResults(results);
  }

  async function handleDepositCheck(event: FormEvent) {
    event.preventDefault();

    const payload = {
      monthlyRent: Number(rent),
      landlordDemand: demand ? Number(demand) : undefined
    };

    const response = await fetch(`${API_BASE}/api/deposit-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as DepositResult;
    setDepositResult(data);
  }

  const rentTrends = useMemo(() => {
    if (!testData) return [];

    const byLocalityBhk = new Map<string, typeof testData["rentData"]>();

    testData.rentData.forEach((point) => {
      const key = `${point.locality}|${point.bhk}`;
      if (!byLocalityBhk.has(key)) byLocalityBhk.set(key, []);
      byLocalityBhk.get(key)!.push(point);
    });

    return Array.from(byLocalityBhk.entries()).map(([key, points]) => {
      const [locality, bhk] = key.split("|");
      const rents = points.map((p) => p.monthlyRent).sort((a, b) => a - b);
      const avg = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);
      const p25 = rents[Math.floor(rents.length * 0.25)] ?? avg;
      const p75 = rents[Math.floor(rents.length * 0.75)] ?? avg;

      return { locality, bhk, avg, p25, p75, count: points.length };
    });
  }, [testData]);

  async function handleReviewSubmit(event: FormEvent) {
    event.preventDefault();

    const payload: ReviewInput = {
      landlordId: "ll-001",
      reviewerType: "IT_PROFESSIONAL",
      locality: "Bengaluru",
      bhk: "2BHK",
      body: reviewBody,
      depositReturned: "PARTIAL",
      ratings: {
        fairness: 2,
        communication: 3,
        maintenance: 3,
        depositHandling: 1,
        privacy: 2
      },
      tags: ["Deposit demanded", "Surprise visits"]
    };

    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setReviewStatus(`Submission failed: ${data.message ?? "Invalid data"}`);
      return;
    }

    setReviewStatus(`Submitted successfully. Review ID: ${data.reviewId}`);
    setReviewBody("");
  }

  if (dataLoading) {
    return (
      <main className="page">
        <section className="hero">
          <h1>DoorSpeaks</h1>
          <p>Loading data...</p>
        </section>
      </main>
    );
  }

  if (dataError || !testData) {
    return (
      <main className="page">
        <section className="hero">
          <h1>DoorSpeaks</h1>
          <p className="alert bad">
            Error loading test data: {dataError}. Make sure the API is running on port 4000.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>DoorSpeaks</h1>
        <p>Know before you sign. Tenant-first rental transparency for Bangalore.</p>
        <span className="badge">Phase 2 MVP</span>
      </section>

      <section className="grid" aria-label="MVP modules">
        <article className="card">
          <h2>Landlord Search</h2>
          <p>Find landlord profiles with community ratings.</p>
          <form onSubmit={handleLandlordSearch}>
            <label htmlFor="query">Landlord or locality</label>
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: HSR, Srinivas, Koramangala"
            />
            <div style={{ height: "0.6rem" }} />
            <button type="submit">Search</button>
          </form>
          <small className="mono">{searchResults.length} profile(s) found</small>
          <div className="list">
            {searchResults.map((landlord) => (
              <LandlordCard key={landlord.id} landlord={landlord} />
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Deposit Checker</h2>
          <p>Instantly compare asked deposit against Karnataka legal cap.</p>
          <form onSubmit={handleDepositCheck}>
            <div className="form-grid">
              <div>
                <label htmlFor="rent">Monthly rent (INR)</label>
                <input
                  id="rent"
                  type="number"
                  min={1}
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="demand">Landlord demand (optional)</label>
                <input
                  id="demand"
                  type="number"
                  min={0}
                  value={demand}
                  onChange={(e) => setDemand(e.target.value)}
                />
              </div>
            </div>
            <div style={{ height: "0.6rem" }} />
            <button type="submit">Check legality</button>
          </form>

          {depositResult ? (
            <div style={{ marginTop: "0.8rem" }}>
              <div className={depositResult.overLimit ? "alert bad" : "alert good"}>
                Legal max: INR {depositResult.legalMax.toLocaleString()} | Asked: INR{" "}
                {depositResult.landlordDemand.toLocaleString()}
              </div>
              <p className="mono">{depositResult.legalReference}</p>
              <p>{depositResult.nextStepTemplate}</p>
            </div>
          ) : null}
        </article>

        <article className="card">
          <h2>Review Submission</h2>
          <p>Draft a verified tenancy review for moderation.</p>
          <form onSubmit={handleReviewSubmit}>
            <label htmlFor="review">Review text</label>
            <textarea
              id="review"
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Describe communication, maintenance, and deposit behavior in detail..."
              required
            />
            <small className="mono">{reviewLength} / 100 minimum characters</small>
            <div style={{ height: "0.6rem" }} />
            <button type="submit" disabled={reviewLength < 100}>
              Submit review
            </button>
          </form>
          <p>{reviewStatus}</p>
        </article>

        <article className="card">
          <h2>Tenant Rights Hub</h2>
          <p>Plain-language legal guidance in English, Kannada, and Hindi.</p>
          <div className="list">
            {testData.rightsGuides.map((guide) => (
              <div className="list-item" key={guide.id}>
                <strong>{guide.title}</strong>
                <p>{guide.summary}</p>
                <small>Languages: {guide.language.join(", ")}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Rent Transparency Map</h2>
          <p>Market rent by locality and BHK type.</p>
          <div className="list">
            {rentTrends.map((trend, idx) => (
              <div className="list-item" key={idx}>
                <strong>{trend.locality}</strong> • {trend.bhk}
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-amber)" }}>
                  ₹{trend.avg.toLocaleString()}
                </div>
                <small className="mono">
                  P25: ₹{trend.p25.toLocaleString()} | P75: ₹{trend.p75.toLocaleString()} ({trend.count} data points)
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Recent Reviews</h2>
          <p>Latest tenant experiences published.</p>
          <div className="list">
            {testData.reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
