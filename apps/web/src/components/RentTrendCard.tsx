interface Props {
  locality: string;
  bhk: string;
  avgRent: number;
  p25: number;
  p75: number;
  count: number;
}

export function RentTrendCard({ locality, bhk, avgRent, p25, p75, count }: Props) {
  const withinRange = p75 >= avgRent && avgRent >= p25;

  return (
    <div className="rent-card">
      <div>
        <strong>{locality}</strong> • {bhk}
      </div>
      <div className="rent-display">
        <div className="rent-value">₹{avgRent.toLocaleString()}</div>
        <small className="mono">
          P25: ₹{p25.toLocaleString()} | P75: ₹{p75.toLocaleString()}
        </small>
      </div>
      <div className={withinRange ? "alert good" : "alert bad"}>
        {withinRange ? "✓ Within market range" : "⚠ Check market before agreeing"}
      </div>
      <small className="mono">{count} verified data point(s)</small>
    </div>
  );
}
