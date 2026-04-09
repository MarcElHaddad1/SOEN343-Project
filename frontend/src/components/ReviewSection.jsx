import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export default function ReviewSection({ vehicleId }) {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    apiRequest(`/api/vehicles/${vehicleId}/reviews`)
      .then((data) => {
        if (!mounted) return;
        setReviews(data.reviews || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Reviews are not available yet.");
      });

    return () => {
      mounted = false;
    };
  }, [vehicleId]);

  return (
    <section className="container" style={{ marginTop: 24 }}>
      <h2>Reviews</h2>
      {error ? <p className="auth-subtext">{error}</p> : null}
      {!error && reviews.length === 0 ? <p className="auth-subtext">No reviews yet.</p> : null}
      {reviews.length > 0 ? (
        <div className="list booking-grid">
          {reviews.map((review) => (
            <article key={review._id || review.id} className="list-card booking-card">
              <div className="booking-header">
                <h3>{review.user?.name || "Guest"}</h3>
                <span className="vehicle-pill pill-ok">{review.rating}/5</span>
              </div>
              <p className="meta-line">{review.comment || "No comment provided."}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}