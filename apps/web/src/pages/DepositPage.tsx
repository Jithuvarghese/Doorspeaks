import { FormEvent, useState } from "react";

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

export function DepositPage() {
  const [rent, setRent] = useState("");
  const [demand, setDemand] = useState("");
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

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
      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Deposit checker</span>
            <h2>Instant legal comparison</h2>
          </div>
        </div>
        <p className="surface-note">Check whether the deposit demand exceeds the Karnataka residential cap.</p>
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
      </article>
    </section>
  );
}
