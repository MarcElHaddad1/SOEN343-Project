import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxUses: "",
  expiresAt: "",
  active: true
};

export default function AdminPromosPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [tab, setTab] = useState("list");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await apiRequest("/api/promos", { token });
      setPromos(data.promos || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.code || !form.discountValue) {
      setError("Code and discount value are required");
      return;
    }

    const payload = {
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      active: form.active
    };

    try {
      setBusy(true);
      if (editingId) {
        await apiRequest(`/api/promos/${editingId}`, { method: "PATCH", token, body: payload });
        showToast("Promo code updated.");
      } else {
        await apiRequest("/api/promos", { method: "POST", token, body: { ...payload, code: form.code } });
        showToast("Promo code created.");
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

  async function toggleActive(promo) {
    try {
      await apiRequest(`/api/promos/${promo._id}`, {
        method: "PATCH",
        token,
        body: { active: !promo.active }
      });
      showToast(promo.active ? "Promo deactivated." : "Promo activated.");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this promo code permanently?")) return;
    try {
      await apiRequest(`/api/promos/${id}`, { method: "DELETE", token });
      showToast("Promo code deleted.");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function edit(promo) {
    setEditingId(promo._id);
    setForm({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      maxUses: promo.maxUses !== null ? String(promo.maxUses) : "",
      expiresAt: promo.expiresAt ? promo.expiresAt.split("T")[0] : "",
      active: promo.active
    });
    setTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function statusLabel(promo) {
    if (!promo.active) return { label: "Inactive", cls: "pill-bad" };
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { label: "Expired", cls: "pill-bad" };
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return { label: "Exhausted", cls: "pill-bad" };
    return { label: "Active", cls: "pill-ok" };
  }

  return (
    <div className="container">
      <section className="card admin-header-card">
        <h1>Promo Codes</h1>
        <p className="auth-subtext">Create and manage discount codes for customers.</p>
        <div className="vehicle-pill-row">
          <span className="vehicle-pill">Total: {promos.length}</span>
          <span className="vehicle-pill pill-ok">Active: {promos.filter((p) => p.active).length}</span>
          <span className="vehicle-pill pill-bad">Inactive: {promos.filter((p) => !p.active).length}</span>
        </div>
        <div className="tab-row">
          <button className={tab === "list" ? "tab-btn active-tab" : "tab-btn"} onClick={() => setTab("list")}>
            All Codes
          </button>
          <button className={tab === "create" ? "tab-btn active-tab" : "tab-btn"} onClick={() => { setTab("create"); setEditingId(""); setForm(emptyForm); }}>
            {editingId ? "Edit Code" : "New Code"}
          </button>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {tab === "create" ? (
        <section className="card">
          <h2>{editingId ? "Edit Promo Code" : "Create Promo Code"}</h2>
          <form className="form" onSubmit={submit}>

            <label>Code</label>
            <input
              value={form.code}
              disabled={!!editingId}
              placeholder="e.g. SUMMER20"
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            />

            <label>Discount Type</label>
            <select
              value={form.discountType}
              onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>

            <label>
              {form.discountType === "percentage" ? "Discount %" : "Discount Amount ($)"}
            </label>
            <input
              type="number"
              min="0"
              max={form.discountType === "percentage" ? "100" : undefined}
              step="0.01"
              value={form.discountValue}
              onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
            />

            <label>Max Uses (leave blank for unlimited)</label>
            <input
              type="number"
              min="1"
              value={form.maxUses}
              placeholder="Unlimited"
              onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
            />

            <label>Expires At (leave blank to never expire)</label>
            <input
              type="date"
              value={form.expiresAt}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
            />

            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              />{" "}Active
            </label>

            <div className="admin-actions">
              <button type="submit" disabled={busy}>{busy ? "Saving..." : editingId ? "Save Changes" : "Create Code"}</button>
              {editingId && (
                <button type="button" className="reject-btn" onClick={() => { setEditingId(""); setForm(emptyForm); setTab("list"); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        <div className="table-wrap admin-table-wrap">
          <table className="data-table admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Used / Max</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr><td colSpan={7}>No promo codes yet.</td></tr>
              ) : promos.map((promo) => {
                const { label, cls } = statusLabel(promo);
                return (
                  <tr key={promo._id}>
                    <td><strong>{promo.code}</strong></td>
                    <td>{promo.discountType === "percentage" ? "%" : "$"}</td>
                    <td>
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                    </td>
                    <td>{promo.usedCount} / {promo.maxUses ?? "∞"}</td>
                    <td>{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : "Never"}</td>
                    <td><span className={`vehicle-pill ${cls}`}>{label}</span></td>
                    <td>
                      <div className="admin-actions">
                        <button className="approve-btn" onClick={() => edit(promo)}>Edit</button>
                        <button
                          className={promo.active ? "reject-btn" : "approve-btn"}
                          onClick={() => toggleActive(promo)}
                        >
                          {promo.active ? "Deactivate" : "Activate"}
                        </button>
                        <button className="reject-btn" onClick={() => remove(promo._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
