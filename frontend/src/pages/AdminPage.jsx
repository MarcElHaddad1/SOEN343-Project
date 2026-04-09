import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [providers, setProviders] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await apiRequest("/api/admin/providers", { token });
      setProviders(data.providers || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function approve(userId) {
    try {
      setBusyId(userId);
      await apiRequest(`/api/admin/providers/${userId}/approve`, {
        method: "POST",
        token
      });
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
      await apiRequest(`/api/admin/providers/${userId}/reject`, {
        method: "POST",
        token
      });
      showToast("Provider rejected.");
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
      <section className="card admin-header-card">
        <h1>Provider Approval Center</h1>
        <p className="auth-subtext">
          Review all provider applications and manage approval status.
        </p>
        <div className="vehicle-pill-row">
          <span className="vehicle-pill">Total: {providers.length}</span>
          <span className="vehicle-pill pill-ok">Approved: {providers.filter((p) => p.approved).length}</span>
          <span className="vehicle-pill">Pending: {providers.filter((p) => !p.approved && !p.rejected).length}</span>
          <span className="vehicle-pill pill-bad">Rejected: {providers.filter((p) => p.rejected).length}</span>
          <span className="vehicle-pill">Role: Provider</span>
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
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={7}>No pending providers.</td>
              </tr>
            ) : providers.map((provider) => (
              <tr key={provider._id}>
                <td>{provider.name}</td>
                <td>{provider.email}</td>
                <td>{provider.phone || "-"}</td>
                <td>{provider.role}</td>
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
                      disabled={busyId === provider._id}
                      onClick={() => approve(provider._id)}
                    >
                      {busyId === provider._id ? "Saving..." : "Approve"}
                    </button>
                    <button
                      className="reject-btn"
                      disabled={busyId === provider._id}
                      onClick={() => reject(provider._id)}
                    >
                      {busyId === provider._id ? "Saving..." : "Reject"}
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
