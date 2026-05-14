import type { Landlord } from "@doorspeaks/shared";

interface Props {
  landlord: Landlord;
}

export function LandlordCard({ landlord }: Props) {
  return (
    <div className="landlord-card">
      <div className="landlord-header">
        <h3 style={{ fontSize: "1.1rem" }}>{landlord.name}</h3>
        <div className="rating-stars">
          <span className="stars">{"★".repeat(Math.floor(landlord.avgRating))}</span>
          <span className="rating-text">{landlord.avgRating.toFixed(1)}/5</span>
        </div>
      </div>
      <p>
        <strong>{landlord.locality}</strong>
      </p>
      <small className="mono">{landlord.reviewCount} verified review(s)</small>
    </div>
  );
}
