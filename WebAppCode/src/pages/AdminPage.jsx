import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      // Fix: use /pending-providers for the approval queue instead of /providers.
      // /providers returns ALL providers (used by stats page); the approval center
      // should only show those waiting for a decision.
      const [pendingData, allData] = await Promise.all([
        apiRequest("/api/admin/pending-providers", { token }),
        apiRequest("/api/admin/providers", { token })
      ]);
      setPending(pendingData.providers || []);
      setAll(allData.providers || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function approve(userId) {
    try {
      setBusyId(userId);
      await apiRequest(`/api/admin/providers/${userId}/approve`, { method: "POST", token });
      showToast("Provider approved successfully.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusyId("");
    }
  }

  async function reject(userId) {
    try {
      setBusyId(userId);
      await apiRequest(`/api/admin/providers/${userId}/reject`, { method: "POST", token });
      showToast("Provider rejected.");
      await load();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setBusyId("");
    }
  }

  const displayed = tab === "pending" ? pending : all;

  return (
    <div className="container">
      <section className="card admin-header-card">
        <h1>Provider Approval Center</h1>
        <p className="auth-subtext">
          Review provider applications and manage approval status.
        </p>
        <div className="vehicle-pill-row">
          <span className="vehicle-pill">All Providers: {all.length}</span>
          <span className="vehicle-pill pill-ok">Approved: {all.filter((p) => p.approved).length}</span>
          <span className="vehicle-pill">Pending: {pending.length}</span>
          <span className="vehicle-pill pill-bad">Rejected: {all.filter((p) => p.rejected).length}</span>
        </div>
        <div className="tab-row">
          <button
            className={tab === "pending" ? "tab-btn active-tab" : "tab-btn"}
            onClick={() => setTab("pending")}
          >
            Pending ({pending.length})
          </button>
          <button
            className={tab === "all" ? "tab-btn active-tab" : "tab-btn"}
            onClick={() => setTab("all")}
          >
            All Providers
          </button>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="table-wrap admin-table-wrap">
        <table className="data-table admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  {tab === "pending" ? "No pending providers." : "No providers found."}
                </td>
              </tr>
            ) : displayed.map((provider) => (
              <tr key={provider._id}>
                <td>{provider.name}</td>
                <td>{provider.email}</td>
                <td>{provider.phone || "—"}</td>
                <td>
                  <span className={`vehicle-pill ${provider.approved ? "pill-ok" : provider.rejected ? "pill-bad" : ""}`}>
                    {provider.approved ? "Approved" : provider.rejected ? "Rejected" : "Pending"}
                  </span>
                </td>
                <td>{new Date(provider.createdAt).toLocaleString()}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      className="approve-btn"
                      disabled={busyId === provider._id || provider.approved}
                      onClick={() => approve(provider._id)}
                    >
                      {busyId === provider._id ? "Saving…" : "Approve"}
                    </button>
                    <button
                      className="reject-btn"
                      disabled={busyId === provider._id || provider.rejected}
                      onClick={() => reject(provider._id)}
                    >
                      {busyId === provider._id ? "Saving…" : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
