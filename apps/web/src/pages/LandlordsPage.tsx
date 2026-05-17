import { useMemo, useState, useRef, useEffect } from "react";
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

  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollRail(delta: number) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  // Auto-snap behavior: when user stops scrolling, snap to nearest item (mobile)
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    let tid: number | null = null;

    function onScroll() {
      if (tid) window.clearTimeout(tid);
      // wait for scroll to settle
      tid = window.setTimeout(() => {
        if (!el) return;
        const children = Array.from(el.querySelectorAll<HTMLDivElement>(".landlord-rail-item"));
        if (!children.length) return;
        const scrollLeft = el.scrollLeft;
        // find child with nearest left offset
        let nearest: HTMLDivElement | null = null;
        let nearestDist = Infinity;
        for (const child of children) {
          const offset = child.offsetLeft; // position relative to rail
          const dist = Math.abs(offset - scrollLeft);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = child;
          }
        }
        if (nearest && el) {
          el.scrollTo({ left: nearest.offsetLeft, behavior: "smooth" });
        }
      }, 120);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (tid) window.clearTimeout(tid);
    };
  }, []);

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

      <div className="rail-wrap">
        <button className="rail-nav rail-nav-left" aria-label="Scroll left" onClick={() => scrollRail(-320)}>
          ‹
        </button>
        <div ref={railRef} className="landlord-rail" role="list" aria-label="Landlord profiles">
          {results.map((landlord) => (
            <div className="landlord-rail-item" role="listitem" key={landlord.id}>
              <LandlordCard landlord={landlord} />
            </div>
          ))}
        </div>
        <button className="rail-nav rail-nav-right" aria-label="Scroll right" onClick={() => scrollRail(320)}>
          ›
        </button>
      </div>
    </section>
  );
}
