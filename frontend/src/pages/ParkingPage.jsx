import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ParkingPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [filters, setFilters] = useState({ city: "", available: "true", q: "" });
  const [spots, setSpots] = useState([]);
  const [busySpotId, setBusySpotId] = useState("");
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState({ startDate: "", endDate: "" });

  const cities = useMemo(() => ["", "Montreal", "Toronto", "Vancouver", "Calgary", "Ottawa", "Laval"], []);

  async function load() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "") params.set(k, v);
    });
    const data = await apiRequest(`/api/parking/spots?${params.toString()}`, { token });
    setSpots(data.items || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [token, filters.city, filters.available, filters.q]);

  async function reserve(spotId) {
    if (!reservation.startDate || !reservation.endDate) {
      showToast("Select parking start and end dates first.", "error");
      return;
    }
    try {
      setBusySpotId(spotId);
      const data = await apiRequest("/api/parking/checkout/session", {
        method: "POST",
        token,
        body: { parkingSpotId: spotId, startDate: reservation.startDate, endDate: reservation.endDate }
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusySpotId("");
    }
  }

  return (
    <div className="container">
      <h1>Parking</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h3>Reserve Date Range</h3>
        <div className="toolbar">
          <input type="date" value={reservation.startDate} onChange={(e) => setReservation((p) => ({ ...p, startDate: e.target.value }))} />
          <input type="date" value={reservation.endDate} onChange={(e) => setReservation((p) => ({ ...p, endDate: e.target.value }))} />
        </div>
      </section>

      <div className="toolbar">
        <input placeholder="Search parking name, city, address" value={filters.q} onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))} />
        <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
          {cities.map((city) => <option key={city} value={city}>{city || "All cities"}</option>)}
        </select>
        <select value={filters.available} onChange={(e) => setFilters((p) => ({ ...p, available: e.target.value }))}>
          <option value="">All spots</option>
          <option value="true">Available only</option>
          <option value="false">Full only</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Provider</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {spots.length === 0 ? (
              <tr><td colSpan={7}>No parking spots found.</td></tr>
            ) : spots.map((spot) => (
              <tr key={spot._id}>
                <td>{spot.name}</td>
                <td>{spot.city}</td>
                <td>{spot.addressFormatted}</td>
                <td>${spot.pricePerHour}/day</td>
                <td>{spot.capacityAvailable} / {spot.capacityTotal}</td>
                <td>{spot.providerId?.name || "-"}</td>
                <td>
                  <button
                    className="approve-btn"
                    disabled={spot.capacityAvailable <= 0 || busySpotId === spot._id}
                    onClick={() => reserve(spot._id)}
                  >
                    {busySpotId === spot._id ? "Redirecting..." : (spot.capacityAvailable <= 0 ? "Full" : "Checkout")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
