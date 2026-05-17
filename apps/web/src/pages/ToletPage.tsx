import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AuthSession } from "../auth";
import { useTestData } from "../hooks";

type ListingCard = {
  id: string;
  title: string;
  locality: string;
  ward: string;
  city: string;
  bhk: "1BHK" | "2BHK" | "3BHK";
  furnishing: "UNFURNISHED" | "SEMI" | "FULLY";
  monthlyRent: number;
  depositPaid: number;
  landlordName: string;
  landlordRating: number;
  reviewCount: number;
  reviewSnippet: string;
  reviewTags: string[];
  imageUrl: string;
  description: string;
  postedBy: string;
  createdAt: string;
};

const API_BASE = "http://localhost:4000";

const listingPhotos = [
  "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
];

function formatCurrency(value: number) {
  return `INR ${value.toLocaleString()}`;
}

interface Props {
  session: AuthSession | null;
  onRequireAuth?: () => void;
}

export function ToletPage({ session, onRequireAuth }: Props) {
  const { data } = useTestData();
  const [liveTolets, setLiveTolets] = useState<ListingCard[]>([]);
  const [toletStatus, setToletStatus] = useState<string | null>(null);
  const [toletForm, setToletForm] = useState({
    title: "",
    locality: "",
    ward: "",
    city: "Bengaluru",
    bhk: "2BHK" as "1BHK" | "2BHK" | "3BHK",
    furnishing: "SEMI" as "UNFURNISHED" | "SEMI" | "FULLY",
    monthlyRent: "",
    deposit: "",
    photoUrl: listingPhotos[0] ?? "",
    description: ""
  });

  useEffect(() => {
    const fetchTolets = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tolets`);
        const payload = (await response.json()) as {
          results?: Array<{
            id: string;
            title: string;
            locality: string;
            ward: string;
            city: string;
            bhk: "1BHK" | "2BHK" | "3BHK";
            furnishing: "UNFURNISHED" | "SEMI" | "FULLY";
            monthlyRent: number;
            deposit: number;
            photoUrl: string;
            description: string;
            postedBy: string;
            createdAt: string;
          }>;
        };

        const reviewsByLocality = data?.reviews ?? [];
        const landlords = data?.landlords ?? [];

        const mapped = (payload.results ?? []).map((listing) => {
          const localityReviews = reviewsByLocality.filter((review) => review.locality === listing.locality);
          const landlord = landlords.find((entry) => entry.locality === listing.locality);
          const primaryReview = localityReviews[0];

          return {
            id: listing.id,
            title: listing.title,
            locality: listing.locality,
            ward: listing.ward,
            city: listing.city,
            bhk: listing.bhk,
            furnishing: listing.furnishing,
            monthlyRent: listing.monthlyRent,
            depositPaid: listing.deposit,
            landlordName: landlord?.name ?? listing.postedBy,
            landlordRating: landlord?.avgRating ?? 4,
            reviewCount: localityReviews.length,
            reviewSnippet:
              primaryReview?.body.slice(0, 150) ?? listing.description,
            reviewTags: primaryReview?.tags.slice(0, 3) ?? ["New listing"],
            imageUrl: listing.photoUrl,
            description: listing.description,
            postedBy: listing.postedBy,
            createdAt: listing.createdAt
          } satisfies ListingCard;
        });

        setLiveTolets(mapped);
      } catch {
        setLiveTolets([]);
      }
    };

    fetchTolets();
  }, [data]);

  const curatedFromTestData = useMemo<ListingCard[]>(() => {
    const rentPoints = data?.rentData ?? [];
    const reviews = data?.reviews ?? [];
    const landlords = data?.landlords ?? [];
    const curated: ListingCard[] = [];

    rentPoints.forEach((point, index) => {
      const landlord = landlords.find((entry) => entry.locality === point.locality);
      const matchingReviews = reviews.filter((review) => review.locality === point.locality && review.bhk === point.bhk);
      const primaryReview = matchingReviews[0] ?? reviews.find((review) => review.locality === point.locality);

      if (!landlord || !primaryReview) {
        return;
      }

      curated.push({
        id: point.id,
        title: `${point.bhk} ${point.locality}`,
        locality: point.locality,
        ward: point.ward,
        city: point.city,
        bhk: point.bhk,
        furnishing: point.furnishing,
        monthlyRent: point.monthlyRent,
        depositPaid: point.depositPaid,
        landlordName: landlord.name,
        landlordRating: landlord.avgRating,
        reviewCount: matchingReviews.length || landlord.reviewCount,
        reviewSnippet: primaryReview.body.length > 150 ? `${primaryReview.body.slice(0, 150)}…` : primaryReview.body,
        reviewTags: primaryReview.tags.slice(0, 3),
        imageUrl: (listingPhotos[index % listingPhotos.length] ?? listingPhotos[0]) as string,
        description: "Well-maintained rental with practical commute options and clear paperwork expectations.",
        postedBy: landlord.name,
        createdAt: new Date().toISOString()
      });
    });

    return curated.slice(0, 6);
  }, [data]);

  const listings = liveTolets.length ? liveTolets : curatedFromTestData;

  async function handleToletSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      setToletStatus("Login as a tenant to post a listing.");
      onRequireAuth?.();
      return;
    }

    const response = await fetch(`${API_BASE}/api/tolets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        ...toletForm,
        monthlyRent: Number(toletForm.monthlyRent),
        deposit: Number(toletForm.deposit)
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setToletStatus(payload.message ?? "Could not post listing.");
      return;
    }

    const created = payload.listing as {
      id: string;
      title: string;
      locality: string;
      ward: string;
      city: string;
      bhk: "1BHK" | "2BHK" | "3BHK";
      furnishing: "UNFURNISHED" | "SEMI" | "FULLY";
      monthlyRent: number;
      deposit: number;
      photoUrl: string;
      description: string;
      postedBy: string;
      createdAt: string;
    };

    setLiveTolets((current) => [
      {
        id: created.id,
        title: created.title,
        locality: created.locality,
        ward: created.ward,
        city: created.city,
        bhk: created.bhk,
        furnishing: created.furnishing,
        monthlyRent: created.monthlyRent,
        depositPaid: created.deposit,
        landlordName: created.postedBy,
        landlordRating: 4,
        reviewCount: 0,
        reviewSnippet: created.description,
        reviewTags: ["New listing"],
        imageUrl: created.photoUrl,
        description: created.description,
        postedBy: created.postedBy,
        createdAt: created.createdAt
      },
      ...current
    ]);

    setToletStatus("To-let listing posted successfully.");
    setToletForm((current) => ({
      ...current,
      title: "",
      locality: "",
      ward: "",
      monthlyRent: "",
      deposit: "",
      description: ""
    }));
  }

  return (
    <section className="page-stack">
      <article className="card card-wide tolet-hero">
        <div className="section-header">
          <div>
            <span className="eyebrow">To-let listings</span>
            <h2>Photos, reviews, and the essential details in one place</h2>
          </div>
        </div>
        <p className="surface-note">
          Browse places with a quick visual preview, verified tenant feedback, and the practical details you need before you visit.
        </p>
        <div className="tolet-stats">
          <div className="tolet-stat">
            <strong>{listings.length}</strong>
            <span>Featured listings</span>
          </div>
          <div className="tolet-stat">
            <strong>{data?.reviews.length ?? 0}</strong>
            <span>Published reviews</span>
          </div>
          <div className="tolet-stat">
            <strong>{data?.rentData.filter((point) => point.verifiedByReceipt).length ?? 0}</strong>
            <span>Receipt-verified rents</span>
          </div>
        </div>
      </article>

      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Post your to-let</span>
            <h2>Tenants can add available rental listings</h2>
          </div>
        </div>
        {session?.user.role === "TENANT" ? (
          <form className="stacked-form" onSubmit={handleToletSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="tolet-title">Listing title</label>
                <input id="tolet-title" value={toletForm.title} onChange={(event) => setToletForm((c) => ({ ...c, title: event.target.value }))} required />
              </div>
              <div>
                <label htmlFor="tolet-locality">Locality</label>
                <input id="tolet-locality" value={toletForm.locality} onChange={(event) => setToletForm((c) => ({ ...c, locality: event.target.value }))} required />
              </div>
              <div>
                <label htmlFor="tolet-ward">Ward</label>
                <input id="tolet-ward" value={toletForm.ward} onChange={(event) => setToletForm((c) => ({ ...c, ward: event.target.value }))} required />
              </div>
              <div>
                <label htmlFor="tolet-city">City</label>
                <input id="tolet-city" value={toletForm.city} onChange={(event) => setToletForm((c) => ({ ...c, city: event.target.value }))} required />
              </div>
              <div>
                <label htmlFor="tolet-bhk">BHK</label>
                <select id="tolet-bhk" value={toletForm.bhk} onChange={(event) => setToletForm((c) => ({ ...c, bhk: event.target.value as "1BHK" | "2BHK" | "3BHK" }))}>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                </select>
              </div>
              <div>
                <label htmlFor="tolet-furnishing">Furnishing</label>
                <select id="tolet-furnishing" value={toletForm.furnishing} onChange={(event) => setToletForm((c) => ({ ...c, furnishing: event.target.value as "UNFURNISHED" | "SEMI" | "FULLY" }))}>
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI">Semi furnished</option>
                  <option value="FULLY">Fully furnished</option>
                </select>
              </div>
              <div>
                <label htmlFor="tolet-rent">Monthly rent</label>
                <input id="tolet-rent" type="number" min={1} value={toletForm.monthlyRent} onChange={(event) => setToletForm((c) => ({ ...c, monthlyRent: event.target.value }))} required />
              </div>
              <div>
                <label htmlFor="tolet-deposit">Deposit</label>
                <input id="tolet-deposit" type="number" min={0} value={toletForm.deposit} onChange={(event) => setToletForm((c) => ({ ...c, deposit: event.target.value }))} required />
              </div>
            </div>
            <div>
              <label htmlFor="tolet-photo">Photo URL</label>
              <input id="tolet-photo" type="url" value={toletForm.photoUrl} onChange={(event) => setToletForm((c) => ({ ...c, photoUrl: event.target.value }))} required />
            </div>
            <div>
              <label htmlFor="tolet-description">Description</label>
              <textarea id="tolet-description" value={toletForm.description} onChange={(event) => setToletForm((c) => ({ ...c, description: event.target.value }))} required />
            </div>
            <button type="submit">Post to-let</button>
          </form>
        ) : (
          <p className="surface-note">Login with a tenant account to post a to-let listing.</p>
        )}
        {toletStatus ? <p className="surface-note">{toletStatus}</p> : null}
      </article>

      <div className="tolet-grid">
        {listings.map((listing) => (
          <article className="card tolet-card" key={listing.id}>
            <img className="tolet-photo" src={listing.imageUrl} alt={`${listing.title} interior`} loading="lazy" />
            <div className="tolet-card-body">
              <div className="tolet-card-header">
                <div>
                  <span className="eyebrow">{listing.locality}</span>
                  <h3>{listing.title}</h3>
                </div>
                <div className="tolet-rating">
                  <span className="stars">{"★".repeat(Math.floor(listing.landlordRating))}</span>
                  <span className="rating-text">{listing.landlordRating.toFixed(1)}/5</span>
                </div>
              </div>

              <p className="surface-note">{listing.ward}, {listing.city} • Hosted by {listing.landlordName}</p>

              <div className="tolet-price-row">
                <div>
                  <small className="surface-note">Monthly rent</small>
                  <strong>{formatCurrency(listing.monthlyRent)}</strong>
                </div>
                <div>
                  <small className="surface-note">Deposit</small>
                  <strong>{formatCurrency(listing.depositPaid)}</strong>
                </div>
              </div>

              <div className="tolet-meta-grid">
                <div className="tolet-meta-item">
                  <span className="surface-note">BHK</span>
                  <strong>{listing.bhk}</strong>
                </div>
                <div className="tolet-meta-item">
                  <span className="surface-note">Furnishing</span>
                  <strong>{listing.furnishing}</strong>
                </div>
                <div className="tolet-meta-item">
                  <span className="surface-note">Reviews</span>
                  <strong>{listing.reviewCount}</strong>
                </div>
                <div className="tolet-meta-item">
                  <span className="surface-note">Rating</span>
                  <strong>{listing.landlordRating.toFixed(1)}</strong>
                </div>
              </div>

              <div className="tolet-review">
                <span className="eyebrow">Tenant review</span>
                <p>{listing.reviewSnippet}</p>
                <div className="tags">
                  {listing.reviewTags.map((tag) => (
                    <span className="badge" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}