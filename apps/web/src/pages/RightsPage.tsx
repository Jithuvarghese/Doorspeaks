import { useTestData } from "../hooks";
import type { TestDataPayload } from "./types";
import { RentTrendCard } from "../components/RentTrendCard";

export function RightsPage() {
  const { data } = useTestData();

  const rentTrends = (data?.rentData ?? []).reduce<Record<string, TestDataPayload["rentData"]>>((acc, point) => {
    const key = `${point.locality}|${point.bhk}`;
    acc[key] ??= [];
    acc[key].push(point);
    return acc;
  }, {});

  const trendCards = Object.entries(rentTrends).map(([key, points]) => {
    const [locality = "", bhk = ""] = key.split("|");
    const rents = points.map((point) => point.monthlyRent).sort((a, b) => a - b);
    const avg = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);
    const p25 = rents[Math.floor(rents.length * 0.25)] ?? avg;
    const p75 = rents[Math.floor(rents.length * 0.75)] ?? avg;

    return { locality, bhk, avg, p25, p75, count: points.length };
  });

  return (
    <section className="page-stack">
      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tenant rights</span>
            <h2>Plain-language legal guidance</h2>
          </div>
        </div>
        <div className="list">
          {data?.rightsGuides.map((guide) => (
            <div className="list-item soft-item" key={guide.id}>
              <strong>{guide.title}</strong>
              <p>{guide.summary}</p>
              <small className="mono">Languages: {guide.language.join(", ")}</small>
            </div>
          ))}
        </div>
      </article>

      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Rent transparency</span>
            <h2>Locality and BHK benchmarks</h2>
          </div>
        </div>
        <div className="list">
          {trendCards.map((trend, idx) => (
            <RentTrendCard
              key={idx}
              locality={trend.locality}
              bhk={trend.bhk}
              avgRent={trend.avg}
              p25={trend.p25}
              p75={trend.p75}
              count={trend.count}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
