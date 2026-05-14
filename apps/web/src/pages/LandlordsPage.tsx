import { useMemo, useState } from "react";
import { useTestData } from "../hooks";
import { LandlordCard } from "../components/LandlordCard";

export function LandlordsPage() {
  const { data } = useTestData();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!data) return [];
    const q = query.toLowerCase().trim();
    if (!q) return data.landlords;
    return data.landlords.filter(
      (landlord) => landlord.name.toLowerCase().includes(q) || landlord.locality.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <section className="page-stack">
      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Landlord search</span>
            <h2>Profiles and tenant sentiment</h2>
          </div>
          <small className="mono">{results.length} result(s)</small>
        </div>
        <div className="search-bar search-bar-inline">
          <label className="sr-only" htmlFor="landlord-query">Landlord or locality</label>
          <input
            id="landlord-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search landlord name or locality"
          />
        </div>
      </article>

      <div className="rail-hint">
        Swipe horizontally to browse profiles.
      </div>

      <div className="landlord-rail" role="list" aria-label="Landlord profiles">
        {results.map((landlord) => (
          <div className="landlord-rail-item" role="listitem" key={landlord.id}>
            <LandlordCard landlord={landlord} />
          </div>
        ))}
      </div>
    </section>
  );
}
