import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
<<<<<<< HEAD
import PromoCodeInput from "../components/PromoCodeInput";
=======
>>>>>>> Testing

export default function CheckoutPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState({ startDate: "", endDate: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState(0);
<<<<<<< HEAD
  const [promo, setPromo] = useState(null); // { code, discountedAmount, savings }

=======

  // Fix: compute today's date string for the min attribute on date inputs
  // so users cannot accidentally select dates in the past.
>>>>>>> Testing
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    apiRequest(`/api/vehicles/${id}`).then((data) => setVehicle(data.vehicle));
  }, [id]);

  useEffect(() => {
    if (!form.startDate || !form.endDate) { setDays(0); return; }
<<<<<<< HEAD
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
=======

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

>>>>>>> Testing
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setDays(0);
      return;
    }
<<<<<<< HEAD
    setDays(Math.max(Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)), 1));
  }, [form.startDate, form.endDate]);

  // Clear promo when dates change so the discount stays accurate
  useEffect(() => { setPromo(null); }, [form.startDate, form.endDate]);
=======

    const diff = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    setDays(Math.max(diff, 1));
  }, [form.startDate, form.endDate]);
>>>>>>> Testing

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      setError("Start and end date are required");
      showToast("Start and end date are required", "error");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> Testing
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date must be after start date");
      showToast("End date must be after start date", "error");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const data = await apiRequest("/api/bookings/checkout/session", {
        method: "POST",
        token,
<<<<<<< HEAD
        body: {
          vehicleId: id,
          startDate: form.startDate,
          endDate: form.endDate,
          promoCode: promo?.code || undefined
        }
=======
        body: { vehicleId: id, startDate: form.startDate, endDate: form.endDate }
>>>>>>> Testing
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (!vehicle) return <div className="container">Loading...</div>;

  if (user?.role !== "customer") {
    return (
      <div className="container auth-card">
        <h1>Checkout Restricted</h1>
        <p className="error">Only customer accounts can book vehicles.</p>
        <Link className="back-link" to={`/vehicles/${id}`}>Back to Vehicle Details</Link>
      </div>
    );
  }

<<<<<<< HEAD
  const baseTotal = days > 0 ? days * vehicle.pricePerDay : 0;
  const finalTotal = promo ? promo.discountedAmount : baseTotal;
=======
  const estimatedTotal = days > 0 ? days * vehicle.pricePerDay : 0;
>>>>>>> Testing

  return (
    <div className="container checkout-wrap">
      <Link className="back-link" to={`/vehicles/${id}`}>Back to Vehicle Details</Link>

      <div className="checkout-grid">
        <section className="checkout-card">
          <div className="checkout-head">
            <h1>Secure Checkout</h1>
            <p className="auth-subtext">Choose dates and continue on Stripe.</p>
          </div>

          <form onSubmit={onSubmit} className="form checkout-form">
            <label>Start Date</label>
<<<<<<< HEAD
=======
            {/* Fix: min={todayStr} prevents selecting dates in the past */}
>>>>>>> Testing
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              min={todayStr}
              onChange={onChange}
              required
            />

            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              min={form.startDate || todayStr}
              onChange={onChange}
              required
            />

<<<<<<< HEAD
            {/* Promo code — only shown when dates are selected so amount is known */}
            {baseTotal > 0 && (
              <>
                <label>Promo Code (optional)</label>
                <PromoCodeInput
                  amount={baseTotal}
                  onApply={(result) => setPromo(result)}
                  onRemove={() => setPromo(null)}
                />
              </>
            )}

=======
>>>>>>> Testing
            <button type="submit" disabled={busy}>
              {busy ? "Redirecting..." : "Continue to Stripe"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>

        <aside className="checkout-card checkout-summary">
          <img src={vehicle.imageUrl} alt={vehicle.name} className="checkout-image" />
          <h3>{vehicle.name}</h3>
          <p className="meta-line">{vehicle.type} in {vehicle.city}</p>
          <p className="address-line">{vehicle.addressFormatted}</p>
<<<<<<< HEAD

=======
>>>>>>> Testing
          <div className="summary-line">
            <span>Rate</span>
            <strong>${vehicle.pricePerDay}/day</strong>
          </div>
          <div className="summary-line">
            <span>Duration</span>
            <strong>{days} day(s)</strong>
          </div>
<<<<<<< HEAD
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>${baseTotal}</strong>
          </div>

          {promo && (
            <div className="summary-line promo-savings-line">
              <span>Promo ({promo.code})</span>
              <strong className="pill-ok">− ${promo.savings.toFixed(2)}</strong>
            </div>
          )}

          <div className="summary-line total-line">
            <span>Total</span>
            <strong>${finalTotal.toFixed(2)}</strong>
=======
          <div className="summary-line total-line">
            <span>Estimated Total</span>
            <strong>${estimatedTotal}</strong>
>>>>>>> Testing
          </div>
        </aside>
      </div>
    </div>
  );
}
