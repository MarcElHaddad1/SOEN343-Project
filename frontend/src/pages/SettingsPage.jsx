import { useState } from "react";
import { apiRequest } from "../api/client";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SettingsPage() {
  const { token, user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressFormatted: user?.addressFormatted || "",
    addressLat: user?.addressLat || "",
    addressLng: user?.addressLng || ""
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/auth/me", { method: "PATCH", token, body: profile });
      await refreshUser();
      setMessage("Profile updated");
      showToast("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/auth/me/password", { method: "PATCH", token, body: passwordForm });
      setMessage("Password updated");
      showToast("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  return (
    <div className="container settings-grid">
      <section className="card">
        <h2>Profile Settings</h2>
        <form onSubmit={saveProfile} className="form">
          <label>Name</label>
          <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />

          <label>Email</label>
          <input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />

          <label>Phone</label>
          <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />

          <AddressAutocomplete
            value={profile.addressFormatted}
            onChange={(val) => setProfile((p) => ({ ...p, addressFormatted: val }))}
            onSelect={({ addressFormatted, lat, lng }) =>
              setProfile((p) => ({ ...p, addressFormatted, addressLat: lat, addressLng: lng }))
            }
          />

          <label>Latitude</label>
          <input value={profile.addressLat} onChange={(e) => setProfile((p) => ({ ...p, addressLat: e.target.value }))} />

          <label>Longitude</label>
          <input value={profile.addressLng} onChange={(e) => setProfile((p) => ({ ...p, addressLng: e.target.value }))} />

          <button type="submit">Save Profile</button>
        </form>
      </section>

      <section className="card">
        <h2>Update Password</h2>
        <form onSubmit={changePassword} className="form">
          <label>Current Password</label>
          <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />

          <label>New Password</label>
          <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />

          <button type="submit">Update Password</button>
        </form>
      </section>

      {message && <p className="ok">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
