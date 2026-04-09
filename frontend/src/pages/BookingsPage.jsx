import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BookingsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [parkingItems, setParkingItems] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [vehicleData, parkingData] = await Promise.all([
        apiRequest("/api/bookings/my", { token }),
        apiRequest("/api/parking/reservations/my", { token })
      ]);
      setItems(vehicleData.items || []);
      setParkingItems(parkingData.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    apiRequest("/api/auth/recommendations/me", { token })
      .then((resp) => setRecommendation(resp?.recommendation?.message || ""))
      .catch(() => setRecommendation(""));
  }, [token]);

  async function returnVehicle(bookingId) {
    try {
      await apiRequest(`/api/bookings/${bookingId}/return`, { method: "POST", token });
      setItems((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: "completed" } : b)));
      showToast("Vehicle returned successfully.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  return (
    <div className="container">
      <h1>My Bookings</h1>
      {error && <p className="error">{error}</p>}
      {recommendation ? (
        <section className="card" style={{ marginBottom: 12 }}>
          <h3>Recommended For You</h3>
          <p className="auth-subtext">{recommendation}</p>
        </section>
      ) : null}

      <section className="table-wrap" style={{ marginBottom: 14 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Parking Spot</th>
              <th>City</th>
              <th>Date Range</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {parkingItems.length === 0 ? (
              <tr><td colSpan={5}>No parking reservations yet.</td></tr>
            ) : parkingItems.map((item) => (
              <tr key={item._id}>
                <td>{item.parkingSpotId?.name || "Parking Spot"}</td>
                <td>{item.city}</td>
                <td>{new Date(item.startTime).toLocaleDateString()} - {new Date(item.endTime).toLocaleDateString()}</td>
                <td>${item.totalAmount}</td>
                <td>
                  <span className={`vehicle-pill ${item.status === "reserved" ? "" : item.status === "completed" ? "pill-ok" : "pill-bad"}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="list booking-grid">
        {items.map((booking) => (
          <article key={booking._id} className="list-card booking-card">
            <div className="booking-header">
              <h3>{booking.vehicleId?.name}</h3>
              <span className={`vehicle-pill ${booking.status === "completed" ? "pill-ok" : "pill-bad"}`}>
                {booking.status}
              </span>
            </div>
            <p className="meta-line">{booking.vehicleId?.type} - {booking.vehicleId?.city}</p>
            <div className="booking-meta">
              <p><strong>Start:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
            </div>
            <div className="vehicle-footer">
              <p className="price">${booking.totalAmount}<small> total</small></p>
              <button className="return-btn" disabled={booking.status === "completed"} onClick={() => returnVehicle(booking._id)}>
                {booking.status === "completed" ? "Returned" : "Return Vehicle"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
