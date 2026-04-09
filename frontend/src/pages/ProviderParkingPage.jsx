import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  name: "",
  city: "",
  addressFormatted: "",
  lat: "",
  lng: "",
  pricePerHour: "",
  capacityTotal: ""
};

export default function ProviderParkingPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [spots, setSpots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pendingStatus = useMemo(() => {
    if (user?.approved) return "approved";
    return user?.rejected ? "rejected" : "pending";
  }, [user?.approved, user?.rejected]);

  if (!user?.approved) {
    return (
      <div className="container">
        <section className="card">
          <h1>{pendingStatus === "rejected" ? "Parking Provider Access Rejected" : "Parking Provider Access Pending"}</h1>
          <p className="auth-subtext">
            {pendingStatus === "rejected"
              ? "Your provider application was rejected. Contact admin support for next steps."
              : "Your account is under admin review. Parking management will unlock after approval."}
          </p>
          <p className="error">
            {pendingStatus === "rejected"
              ? "Your provider account is currently rejected."
              : "Your provider account is waiting for approval."}
          </p>
        </section>
      </div>
    );
  }

  async function load() {
    const data = await apiRequest("/api/parking/spots/my", { token });
    setSpots(data.items || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.city || !form.addressFormatted || !form.lat || !form.lng || !form.pricePerHour || !form.capacityTotal) {
      showToast("All parking fields are required.", "error");
      return;
    }

    try {
      setBusy(true);
      if (editingId) {
        await apiRequest(`/api/parking/spots/${editingId}`, { method: "PATCH", token, body: form });
        showToast("Parking spot updated.");
      } else {
        await apiRequest("/api/parking/spots", { method: "POST", token, body: form });
        showToast("Parking spot created.");
      }
      setEditingId("");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  function edit(spot) {
    setEditingId(spot._id);
    setForm({
      name: spot.name,
      city: spot.city,
      addressFormatted: spot.addressFormatted,
      lat: String(spot.lat),
      lng: String(spot.lng),
      pricePerHour: String(spot.pricePerHour),
      capacityTotal: String(spot.capacityTotal)
    });
  }

  async function remove(id) {
    try {
      await apiRequest(`/api/parking/spots/${id}`, { method: "DELETE", token });
      showToast("Parking spot deleted.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  return (
    <div className="container">
      <section className="card">
        <h1>Provider Parking Spots</h1>
        <p className="auth-subtext">Add and manage capacity-based parking locations.</p>
        <form className="form" onSubmit={submit}>
          <label>Parking Name</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />

          <label>City</label>
          <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />

          <AddressAutocomplete
            value={form.addressFormatted}
            onChange={(val) => setForm((p) => ({ ...p, addressFormatted: val }))}
            onSelect={({ addressFormatted, lat, lng }) => setForm((p) => ({ ...p, addressFormatted, lat, lng }))}
          />

          <label>Latitude</label>
          <input value={form.lat} onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))} />

          <label>Longitude</label>
          <input value={form.lng} onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))} />

          <label>Price Per Day</label>
          <input type="number" value={form.pricePerHour} onChange={(e) => setForm((p) => ({ ...p, pricePerHour: e.target.value }))} />

          <label>Total Capacity</label>
          <input type="number" value={form.capacityTotal} onChange={(e) => setForm((p) => ({ ...p, capacityTotal: e.target.value }))} />

          <div className="admin-actions">
            <button type="submit" disabled={busy}>{busy ? "Saving..." : (editingId ? "Save Spot" : "Create Spot")}</button>
            {editingId ? (
              <button type="button" className="reject-btn" onClick={() => { setEditingId(""); setForm(emptyForm); }}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="table-wrap" style={{ marginTop: 14 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {spots.length === 0 ? (
              <tr><td colSpan={5}>No parking spots yet.</td></tr>
            ) : spots.map((spot) => (
              <tr key={spot._id}>
                <td>{spot.name}</td>
                <td>{spot.city}</td>
                <td>${spot.pricePerHour}/day</td>
                <td>{spot.capacityAvailable} / {spot.capacityTotal}</td>
                <td>
                  <div className="admin-actions">
                    <button className="approve-btn" onClick={() => edit(spot)}>Edit</button>
                    <button className="reject-btn" onClick={() => remove(spot._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
