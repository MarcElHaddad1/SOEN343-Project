import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ParkingReservationsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    const data = await apiRequest("/api/parking/reservations/my", { token });
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [token]);

  async function completeReservation(id) {
    try {
      setBusyId(id);
      await apiRequest(`/api/parking/reservations/${id}/complete`, { method: "POST", token });
      showToast("Parking reservation completed.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusyId("");
    }
  }

  async function cancelReservation(id) {
    try {
      setBusyId(id);
      await apiRequest(`/api/parking/reservations/${id}/cancel`, { method: "POST", token });
      showToast("Parking reservation cancelled.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="container">
      <h1>My Parking Reservations</h1>
      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Spot</th>
              <th>City</th>
              <th>Date Range</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6}>No parking reservations yet.</td></tr>
            ) : items.map((resv) => (
              <tr key={resv._id}>
                <td>{resv.parkingSpotId?.name || "Parking Spot"}</td>
                <td>{resv.city}</td>
                <td>{new Date(resv.startTime).toLocaleDateString()} - {new Date(resv.endTime).toLocaleDateString()}</td>
                <td>${resv.totalAmount}</td>
                <td>
                  <span className={`vehicle-pill ${resv.status === "reserved" ? "" : resv.status === "completed" ? "pill-ok" : "pill-bad"}`}>
                    {resv.status}
                  </span>
                </td>
                <td>
                  {resv.status === "reserved" ? (
                    <div className="admin-actions">
                      <button className="approve-btn" disabled={busyId === resv._id} onClick={() => completeReservation(resv._id)}>
                        {busyId === resv._id ? "Saving..." : "Complete"}
                      </button>
                      <button className="reject-btn" disabled={busyId === resv._id} onClick={() => cancelReservation(resv._id)}>
                        {busyId === resv._id ? "Saving..." : "Cancel"}
                      </button>
                    </div>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
