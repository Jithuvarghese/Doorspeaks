import { FormEvent, useState } from "react";
import type { PageId, TestDataPayload } from "./types";
import type { ReactNode } from "react";

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

interface Props {
  testData: TestDataPayload;
  onNavigate: (page: PageId) => void;
  onOpenChat: () => void;
}

export function DashboardPage({ testData, onNavigate, onOpenChat }: Props) {
  const [rent, setRent] = useState("");
  const [demand, setDemand] = useState("");
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

  const averageRating =
    testData.landlords.reduce((sum, landlord) => sum + landlord.avgRating, 0) /
    testData.landlords.length;

  const verifiedRentReports = testData.rentData.filter((point) => point.verifiedByReceipt).length;

  async function handleDepositCheck(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`${API_BASE}/api/deposit-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyRent: Number(rent), landlordDemand: demand ? Number(demand) : undefined })
    });

    const data = (await response.json()) as DepositResult;
    setDepositResult(data);
  }

  return (
    <section className="page-stack">
      <div className="hero hero-main hero-dashboard">
        <div className="hero-copy">
          <span className="eyebrow">Editorial trust</span>
          <h2>Rental transparency built like a premium research product.</h2>
          <p>
            Search landlords, inspect rent benchmarks, and browse to-let listings from one clean,
            professional workspace.
          </p>
          <div className="hero-actions">
            <button className="ghost-button" type="button" onClick={() => onNavigate("landlords")}>
              Search landlords
            </button>
            <button className="ghost-button" type="button" onClick={() => onNavigate("reviews")}>
              Read reviews
            </button>
            <button className="ghost-button" type="button" onClick={onOpenChat}>
              Ask AI
            </button>
          </div>
        </div>

        <aside className="hero-panel">
          <Metric value={testData.landlords.length} label="Verified landlords" />
          <Metric value={testData.reviews.length} label="Published reviews" />
          <Metric value={averageRating.toFixed(1)} label="Average score" />
          <Metric value={verifiedRentReports} label="Verified reports" />
        </aside>
      </div>

      <div className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Deposit legality</span>
            <h2>Check your landlord's demand</h2>
          </div>
        </div>
        <p className="surface-note">Compare the landlord's deposit demand against the legal maximum for Karnataka.</p>
        <form onSubmit={handleDepositCheck} className="stacked-form">
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
          <button type="submit">Check legality</button>
        </form>

        {depositResult ? (
          <div className="result-panel">
            <div className={depositResult.overLimit ? "alert bad" : "alert good"}>
              Legal max: INR {depositResult.legalMax.toLocaleString()} | Asked: INR {depositResult.landlordDemand.toLocaleString()}
            </div>
            <p className="surface-note">{depositResult.legalReference}</p>
            <p>{depositResult.nextStepTemplate}</p>
          </div>
        ) : null}
      </div>

      <div className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">At a glance</span>
            <h2>What tenants are checking today</h2>
          </div>
        </div>
        <div className="dashboard-grid">
          <QuickLink title="Landlord search" description="See ratings, locality, and review volume." onClick={() => onNavigate("landlords")} />
          <QuickLink title="Recent reviews" description="Scan published tenant experiences." onClick={() => onNavigate("reviews")} />
          <QuickLink title="To-let listings" description="Browse places with photos and verified reviews." onClick={() => onNavigate("tolet")} />
          <QuickLink title="AI chat" description="Ask Gemini for practical tenant guidance." onClick={onOpenChat} />
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="kpi">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function QuickLink({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button className="quick-link" type="button" onClick={onClick}>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}
