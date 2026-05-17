import { useMemo } from "react";
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
};

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

export function ToletPage() {
  const { data } = useTestData();

  const listings = useMemo<ListingCard[]>(() => {
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
        imageUrl: (listingPhotos[index % listingPhotos.length] ?? listingPhotos[0]) as string
      });
    });

    return curated.slice(0, 6);
  }, [data]);

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