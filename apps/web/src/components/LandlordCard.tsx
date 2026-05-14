import type { Landlord } from "@doorspeaks/shared";

interface Props {
  landlord: Landlord;
}

export function LandlordCard({ landlord }: Props) {
  return (
    <div className="landlord-card">
      <div className="landlord-header">
        <div>
          <h3 style={{ fontSize: "1.1rem" }}>{landlord.name}</h3>
          <p className="surface-note" style={{ margin: "0.25rem 0 0" }}>{landlord.locality}</p>
        </div>
        <div className="rating-stars">
          <span className="stars">{"★".repeat(Math.floor(landlord.avgRating))}</span>
          <span className="rating-text">{landlord.avgRating.toFixed(1)}/5</span>
        </div>
      </div>
      <div className="landlord-meta-row">
        <span className="badge">Verified reviews</span>
        <span className="badge badge-dark">Tenant-first</span>
      </div>
      <small className="mono">{landlord.reviewCount} verified review(s)</small>
    </div>
  );
}
