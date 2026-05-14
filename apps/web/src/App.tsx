import { FormEvent, useMemo, useState } from "react";
import type { Landlord, ReviewInput } from "@doorspeaks/shared";

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

type RightsGuide = {
  id: string;
  title: string;
  summary: string;
  language: string[];
};

export function App() {
  const [query, setQuery] = useState("");
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [searchStatus, setSearchStatus] = useState("Search for a landlord by name or locality.");

  const [rent, setRent] = useState("");
  const [demand, setDemand] = useState("");
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

  const [rights, setRights] = useState<RightsGuide[]>([]);
  const [rightsLoaded, setRightsLoaded] = useState(false);

  const [reviewBody, setReviewBody] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Write at least 100 characters and submit for moderation.");

  const reviewLength = useMemo(() => reviewBody.trim().length, [reviewBody]);

  async function handleLandlordSearch(event: FormEvent) {
    event.preventDefault();
    setSearchStatus("Searching...");

    const response = await fetch(`${API_BASE}/api/landlords?q=${encodeURIComponent(query)}`);
    const data = (await response.json()) as { results: Landlord[] };

    setLandlords(data.results);
    setSearchStatus(`${data.results.length} profile(s) found.`);
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

  async function handleLoadRights() {
    const response = await fetch(`${API_BASE}/api/rights`);
    const data = (await response.json()) as { guides: RightsGuide[] };
    setRights(data.guides);
    setRightsLoaded(true);
  }

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

  return (
    <main className="page">
      <section className="hero">
        <h1>DoorSpeaks</h1>
        <p>Know before you sign. Tenant-first rental transparency for Bangalore.</p>
        <span className="badge">Phase 2 MVP scaffold</span>
      </section>

      <section className="grid" aria-label="MVP modules">
        <article className="card">
          <h2>Landlord Search</h2>
          <p>Find landlord profiles with community ratings.</p>
          <form onSubmit={handleLandlordSearch}>
            <label htmlFor="query">Landlord or locality</label>
            <input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Example: HSR" />
            <div style={{ height: "0.6rem" }} />
            <button type="submit">Search</button>
          </form>
          <p className="mono">{searchStatus}</p>
          <div className="list">
            {landlords.map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.name}</strong>
                <div>{item.locality}</div>
                <small>
                  Rating {item.avgRating} / 5 from {item.reviewCount} review(s)
                </small>
              </div>
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
                <input id="rent" type="number" min={1} value={rent} onChange={(e) => setRent(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="demand">Landlord demand (optional)</label>
                <input id="demand" type="number" min={0} value={demand} onChange={(e) => setDemand(e.target.value)} />
              </div>
            </div>
            <div style={{ height: "0.6rem" }} />
            <button type="submit">Check legality</button>
          </form>

          {depositResult ? (
            <div style={{ marginTop: "0.8rem" }}>
              <div className={depositResult.overLimit ? "alert bad" : "alert good"}>
                Legal max: INR {depositResult.legalMax.toLocaleString()} | Asked: INR {depositResult.landlordDemand.toLocaleString()}
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
          <button type="button" onClick={handleLoadRights}>
            {rightsLoaded ? "Refresh guides" : "Load rights guides"}
          </button>
          <div className="list" style={{ marginTop: "0.7rem" }}>
            {rights.map((guide) => (
              <div className="list-item" key={guide.id}>
                <strong>{guide.title}</strong>
                <p>{guide.summary}</p>
                <small>Languages: {guide.language.join(", ")}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
