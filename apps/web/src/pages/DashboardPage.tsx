import type { ReactNode } from "react";
import type { Landlord, ReviewInput } from "@doorspeaks/shared";

import type { PageId, TestDataPayload } from "./types";

interface Props {
  testData: TestDataPayload;
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ testData, onNavigate }: Props) {
  const averageRating =
    testData.landlords.reduce((sum, landlord) => sum + landlord.avgRating, 0) /
    testData.landlords.length;

  const verifiedRentReports = testData.rentData.filter((point) => point.verifiedByReceipt).length;

  return (
    <section className="page-stack">
      <div className="hero hero-main hero-dashboard">
        <div className="hero-copy">
          <span className="eyebrow">Editorial trust</span>
          <h2>Rental transparency built like a premium research product.</h2>
          <p>
            Search landlords, inspect rent benchmarks, and check tenant rights from one clean,
            professional workspace.
          </p>
          <div className="hero-actions">
            <button className="ghost-button" type="button" onClick={() => onNavigate("landlords")}>
              Search landlords
            </button>
            <button className="ghost-button" type="button" onClick={() => onNavigate("deposit")}>
              Check deposit
            </button>
            <button className="ghost-button" type="button" onClick={() => onNavigate("reviews")}>
              Read reviews
            </button>
          </div>
        </div>

        <aside className="hero-panel">
          <Metric value={testData.landlords.length} label="Verified landlords" />
          <Metric value={testData.reviews.length} label="Published reviews" />
          <Metric value={averageRating.toFixed(1)} label="Average landlord score" />
          <Metric value={verifiedRentReports} label="Verified rent reports" />
        </aside>
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
          <QuickLink title="Deposit checker" description="Compare ask vs legal cap in seconds." onClick={() => onNavigate("deposit")} />
          <QuickLink title="Recent reviews" description="Scan published tenant experiences." onClick={() => onNavigate("reviews")} />
          <QuickLink title="Tenant rights" description="Read plain-language guidance and templates." onClick={() => onNavigate("rights")} />
          <QuickLink title="AI chat" description="Ask Gemini for practical tenant guidance." onClick={() => onNavigate("chat")} />
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
