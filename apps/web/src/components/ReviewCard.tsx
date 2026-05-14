import type { ReviewInput } from "@doorspeaks/shared";

interface Props {
  review: ReviewInput & {
    id: string;
    landlordName: string;
    publishedAt: string;
  };
}

export function ReviewCard({ review }: Props) {
  const avgRating = (
    (review.ratings.fairness +
      review.ratings.communication +
      review.ratings.maintenance +
      review.ratings.depositHandling +
      review.ratings.privacy) /
    5
  ).toFixed(1);

  return (
    <div className="review-card">
      <div className="review-header">
        <strong>{review.landlordName}</strong>
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
          {review.locality} • {review.bhk} • {review.reviewerType.replace(/_/g, " ")}
        </span>
      </div>

      <div className="rating-row">
        <span className="stars">{"★".repeat(Math.floor(Number(avgRating)))}</span>
        <span className="rating-text">{avgRating}/5</span>
      </div>

      <p>{review.body.substring(0, 150)}...</p>

      <div className="tags">
        {review.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="badge">
            {tag}
          </span>
        ))}
      </div>

      <small className="mono" style={{ color: "var(--color-text-secondary)" }}>
        {review.depositReturned === "FULL" ? "✓ Deposit returned" : `Status: ${review.depositReturned}`}
      </small>
    </div>
  );
}
