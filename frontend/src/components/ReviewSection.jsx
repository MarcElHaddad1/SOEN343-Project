import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
<<<<<<< HEAD
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * ReviewSection
 * Displays reviews for a vehicle and lets customers submit/edit their own.
 *
 * Props:
 *   vehicleId  — MongoDB ObjectId string of the vehicle
 */
export default function ReviewSection({ vehicleId }) {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [form, setForm] = useState({ bookingId: "", rating: 5, comment: "" });
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      const data = await apiRequest(`/api/reviews/vehicle/${vehicleId}`);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating);
    } catch {
      // non-blocking
    }
  }

  async function loadEligibleBookings() {
    if (!user || user.role !== "customer") return;
    try {
      const data = await apiRequest("/api/bookings/my", { token });
      // Only completed bookings for this vehicle that haven't been reviewed yet
      const reviewed = new Set(reviews.map((r) => r.bookingId?.toString()));
      const eligible = (data.items || []).filter(
        (b) =>
          b.status === "completed" &&
          (b.vehicleId?._id || b.vehicleId)?.toString() === vehicleId &&
          !reviewed.has(b._id.toString())
      );
      setEligibleBookings(eligible);
      if (eligible.length > 0 && !form.bookingId) {
        setForm((p) => ({ ...p, bookingId: eligible[0]._id }));
      }
    } catch {
      // non-blocking
    }
  }

  useEffect(() => { loadReviews(); }, [vehicleId]);
  useEffect(() => { loadEligibleBookings(); }, [reviews, user]);

  const myReview = reviews.find((r) => r.userId?._id === user?.id || r.userId === user?.id);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editingId) {
        await apiRequest(`/api/reviews/${editingId}`, {
          method: "PATCH",
          token,
          body: { rating: form.rating, comment: form.comment }
        });
        showToast("Review updated.");
      } else {
        await apiRequest("/api/reviews", {
          method: "POST",
          token,
          body: { bookingId: form.bookingId, rating: form.rating, comment: form.comment }
        });
        showToast("Review submitted!");
      }
      setForm({ bookingId: "", rating: 5, comment: "" });
      setEditingId("");
      await loadReviews();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReview(reviewId) {
    try {
      await apiRequest(`/api/reviews/${reviewId}`, { method: "DELETE", token });
      showToast("Review removed.");
      await loadReviews();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function startEdit(review) {
    setEditingId(review._id);
    setForm({ bookingId: review.bookingId, rating: review.rating, comment: review.comment });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  const canSubmit = !editingId && eligibleBookings.length > 0 && !myReview;
  const canEdit = !!myReview;

  return (
    <section className="card review-section">
      <div className="review-header">
        <h3>Reviews</h3>
        {avgRating !== null && (
          <span className="review-avg">
            {renderStars(avgRating)} <strong>{avgRating}</strong>
            <span className="review-count">({reviews.length})</span>
          </span>
        )}
        {reviews.length === 0 && <span className="auth-subtext">No reviews yet.</span>}
      </div>

      {/* Review list */}
      <div className="review-list">
        {reviews.map((r) => (
          <article key={r._id} className="review-card">
            <div className="review-meta">
              <span className="review-author">{r.userId?.name || "Customer"}</span>
              <span className="review-stars">{renderStars(r.rating)}</span>
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
            {user && (r.userId?._id === user.id || r.userId === user.id) && (
              <div className="review-actions">
                <button className="approve-btn" onClick={() => startEdit(r)}>Edit</button>
                <button className="reject-btn" onClick={() => deleteReview(r._id)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Submit / Edit form — customers only */}
      {user?.role === "customer" && (canSubmit || editingId) && (
        <form className="form review-form" onSubmit={submit}>
          <h4>{editingId ? "Edit Your Review" : "Leave a Review"}</h4>

          {!editingId && eligibleBookings.length > 1 && (
            <>
              <label>Booking</label>
              <select
                value={form.bookingId}
                onChange={(e) => setForm((p) => ({ ...p, bookingId: e.target.value }))}
              >
                {eligibleBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {new Date(b.startDate).toLocaleDateString()} –{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Rating</label>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star-btn ${form.rating >= n ? "star-active" : ""}`}
                onClick={() => setForm((p) => ({ ...p, rating: n }))}
              >
                ★
              </button>
            ))}
          </div>

          <label>Comment (optional)</label>
          <textarea
            value={form.comment}
            maxLength={1000}
            rows={3}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            placeholder="Share your experience..."
          />

          <div className="admin-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save Changes" : "Submit Review"}
            </button>
            {editingId && (
              <button
                type="button"
                className="reject-btn"
                onClick={() => { setEditingId(""); setForm({ bookingId: "", rating: 5, comment: "" }); }}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      {/* Prompt unauthenticated or non-customer visitors */}
      {!user && reviews.length === 0 && (
        <p className="auth-subtext">Log in and complete a booking to leave a review.</p>
      )}
    </section>
  );
}

function renderStars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}
=======

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
>>>>>>> origin/Frontend
