import { FormEvent, useState } from "react";
import type { ReviewInput } from "@doorspeaks/shared";
import type { AuthSession } from "../auth";
import { useTestData } from "../hooks";
import { ReviewCard } from "../components/ReviewCard";

const API_BASE = "http://localhost:4000";

interface Props {
  session: AuthSession | null;
  onRequireAuth?: () => void;
}

type ReviewCardData = ReviewInput & {
  id: string;
  landlordName: string;
  publishedAt: string;
};

export function ReviewsPage({ session, onRequireAuth }: Props) {
  const { data } = useTestData();
  const [reviewBody, setReviewBody] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Write at least 100 characters and submit for moderation.");
  const [localReviews, setLocalReviews] = useState<ReviewCardData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reviewLength = reviewBody.trim().length;

  async function handleReviewSubmit(event: FormEvent) {
    event.preventDefault();

    if (!session?.token) {
      setReviewStatus("Login as a customer to submit reviews.");
      onRequireAuth?.();
      return;
    }

    if (session.user.role !== "CUSTOMER") {
      setReviewStatus("Only customer accounts can submit reviews.");
      return;
    }

    if (reviewLength < 100) {
      setReviewStatus("Please write at least 100 characters before submitting.");
      return;
    }

    const payload: ReviewInput = {
      landlordId: "ll-001",
      reviewerType: "IT_PROFESSIONAL",
      locality: "Bengaluru",
      bhk: "2BHK",
      body: reviewBody,
      depositReturned: "PARTIAL",
      ratings: {
        fairness: 2,
        communication: 3,
        maintenance: 3,
        depositHandling: 1,
        privacy: 2
      },
      tags: ["Deposit demanded", "Surprise visits"]
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setReviewStatus(`Submission failed: ${data.message ?? "Invalid data"}`);
        return;
      }

      setReviewStatus(`Submitted successfully. Review ID: ${data.reviewId}`);
      setLocalReviews((current) => [
        {
          ...payload,
          id: data.reviewId ?? `local-${Date.now()}`,
          landlordName: "A. Srinivas",
          publishedAt: new Date().toISOString()
        },
        ...current
      ]);
      setReviewBody("");
    } catch {
      setReviewStatus("Could not submit review right now. Please check API/server and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <article className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Review submission</span>
            <h2>Write a verified tenancy review</h2>
          </div>
        </div>
        <p className="surface-note">Concise, factual language reads more credible and feels more premium.</p>
        <form onSubmit={handleReviewSubmit} className="stacked-form">
          <label htmlFor="review">Review text</label>
          <textarea
            id="review"
            value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)}
            placeholder="Describe communication, maintenance, deposit handling, and privacy in detail..."
            required
          />
          <div className="form-meta">
            <small className="mono">{reviewLength} / 100 minimum characters</small>
            <small className="surface-note">More detail helps other tenants make a better decision.</small>
          </div>
          <button type="submit" disabled={reviewLength < 100 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
        <p className="surface-note">{reviewStatus}</p>
      </article>

      <div className="card card-wide">
        <div className="section-header">
          <div>
            <span className="eyebrow">Recent reviews</span>
            <h2>Published tenant experiences</h2>
          </div>
        </div>
        <div className="list review-grid">
          {localReviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {data?.reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
