import { useEffect, useMemo, useState } from "react";
import { API_URL, apiRequest } from "../api/client";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  name: "",
  type: "Car",
  pricePerDay: "",
  city: "",
  addressFormatted: "",
  lat: "",
  lng: "",
  available: true
};

export default function ProviderPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("create");
  const logoUrl = `${API_URL}/LOGO/rental-car-3d-icon-png-download-10912136.png`;

  async function load() {
    const data = await apiRequest("/api/vehicles?limit=200", { token });
    const own = (data.items || []).filter((vehicle) => vehicle.providerId?._id === user.id);
    setVehicles(own);
  }

  useEffect(() => {
    load();
  }, [token, user.id]);

  const pendingStatus = useMemo(() => {
    if (user.approved) return "approved";
    return user.rejected ? "rejected" : "pending";
  }, [user.approved, user.rejected]);

  if (!user.approved) {
    return (
      <div className="provider-pending">
        <section className="provider-pending-visual">
          <div className="provider-pending-overlay" />
          <div className="provider-pending-content">
            <div className="auth-logo"><img src={logoUrl} alt="Vehicle Rental logo" /></div>
            <h1>{pendingStatus === "rejected" ? "Provider Access Rejected" : "Provider Access Pending"}</h1>
            <p>
              {pendingStatus === "rejected"
                ? "Your provider application was rejected. Contact admin support for next steps."
                : "Your account is created and under admin review."}
            </p>
          </div>
        </section>

        <section className="provider-pending-panel">
          <div className="provider-pending-card">
            <h2>{pendingStatus === "rejected" ? "Application Rejected" : "Waiting For Approval"}</h2>
            <p className="auth-subtext">
              {pendingStatus === "rejected"
                ? "You can update your account info and contact support to re-apply."
                : "You will be able to create and manage listings once approved."}
            </p>
            <ul className="pending-list">
              <li>Account status: <strong>{pendingStatus === "rejected" ? "Rejected" : "Pending"}</strong></li>
              <li>You can browse listings and edit profile settings.</li>
              <li>Provider inventory tools unlock after approval.</li>
            </ul>
            <p className="error">
              {pendingStatus === "rejected"
                ? "Your provider account is currently rejected."
                : "Your provider account is waiting for approval."}
            </p>
          </div>
        </section>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.type || !form.pricePerDay || !form.city || !form.addressFormatted || !form.lat || !form.lng) {
      setError("All vehicle fields are required");
      showToast("All vehicle fields are required", "error");
      return;
    }

    try {
      setBusy(true);
      if (editingId) {
        await apiRequest(`/api/vehicles/${editingId}`, { method: "PATCH", token, body: form });
        showToast("Vehicle updated successfully.");
      } else {
        await apiRequest("/api/vehicles", { method: "POST", token, body: form });
        showToast("Vehicle created successfully.");
      }

      setForm(emptyForm);
      setEditingId("");
      await load();
      setTab("list");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    try {
      await apiRequest(`/api/vehicles/${id}`, { method: "DELETE", token });
      showToast("Vehicle removed.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  function edit(vehicle) {
    setEditingId(vehicle._id);
    setForm({
      name: vehicle.name,
      type: vehicle.type,
      pricePerDay: String(vehicle.pricePerDay),
      city: vehicle.city,
      addressFormatted: vehicle.addressFormatted,
      lat: String(vehicle.lat),
      lng: String(vehicle.lng),
      available: vehicle.available
    });
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container">
      <section className="card admin-header-card">
        <h1>Provider Workspace</h1>
        <p className="auth-subtext">Create, edit, and manage your fleet listings.</p>
        <div className="tab-row">
          <button className={tab === "create" ? "tab-btn active-tab" : "tab-btn"} onClick={() => setTab("create")}>Create / Edit</button>
          <button className={tab === "list" ? "tab-btn active-tab" : "tab-btn"} onClick={() => setTab("list")}>My Listings</button>
        </div>
      </section>

      {tab === "create" ? (
        <section className="card">
          <h2>{editingId ? "Edit Vehicle" : "Create Vehicle"}</h2>
          <form className="form" onSubmit={submit}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />

            <label>Type</label>
            <input value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />

            <label>Price Per Day</label>
            <input type="number" value={form.pricePerDay} onChange={(e) => setForm((p) => ({ ...p, pricePerDay: e.target.value }))} />

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

            <label>
              <input type="checkbox" checked={form.available} onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))} /> Available
            </label>

            <div className="admin-actions">
              <button type="submit" disabled={busy}>{busy ? "Saving..." : (editingId ? "Save Changes" : "Create Vehicle")}</button>
              {editingId ? <button type="button" className="reject-btn" onClick={() => { setEditingId(""); setForm(emptyForm); }}>Cancel Edit</button> : null}
            </div>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
      ) : (
        <section className="table-wrap admin-table-wrap">
          <table className="data-table admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={6}>No listings yet.</td></tr>
              ) : vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.city}</td>
                  <td>${vehicle.pricePerDay}/day</td>
                  <td>
                    <span className={`vehicle-pill ${vehicle.available ? "pill-ok" : "pill-bad"}`}>
                      {vehicle.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="approve-btn" onClick={() => edit(vehicle)}>Edit</button>
                      <button className="reject-btn" onClick={() => remove(vehicle._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
