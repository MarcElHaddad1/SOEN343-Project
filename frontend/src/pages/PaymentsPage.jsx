import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PaymentsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/api/bookings/payments/my", { token })
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="container">
      <h1>Payment History</h1>
      {error && <p className="error">{error}</p>}

      <div className="list booking-grid">
        {items.length === 0 ? (
          <p className="auth-subtext">No payments yet.</p>
        ) : (
          items.map((payment) => (
            <article key={payment.id} className="list-card booking-card">
              <div className="booking-header">
                <h3>{payment.vehicle?.name || "Vehicle"}</h3>
                <span className={`vehicle-pill ${payment.status === "succeeded" ? "pill-ok" : "pill-bad"}`}>
                  {payment.status}
                </span>
              </div>
              <p className="meta-line">{payment.vehicle?.type} - {payment.vehicle?.city}</p>
              <div className="booking-meta">
                <p><strong>Paid:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                <p><strong>Payment Ref:</strong> {payment.stripePaymentIntentId}</p>
                <p><strong>Card:</strong> {payment.cardholderName} ({payment.cardLast4})</p>
              </div>
              <div className="vehicle-footer">
                <p className="price">${payment.amount}<small> paid</small></p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
