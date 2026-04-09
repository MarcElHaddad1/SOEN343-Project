import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CheckoutSuccessPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Processing your Stripe payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("Missing Stripe session id.");
      return;
    }

    apiRequest("/api/bookings/checkout/confirm", {
      method: "POST",
      token,
      body: { sessionId }
    })
      .then(() => {
        setStatus("Payment confirmed. Booking created successfully.");
        setTimeout(() => navigate("/bookings"), 1200);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [searchParams, token, navigate]);

  return (
    <div className="container auth-card">
      <h1>Checkout Success</h1>
      {!error ? <p>{status}</p> : <p className="error">{error}</p>}
      <p><Link to="/bookings">Go to My Bookings</Link></p>
    </div>
  );
}
