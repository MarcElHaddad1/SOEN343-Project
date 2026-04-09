import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ channel, status });

    apiRequest(`/api/notifications/my?${params.toString()}`, { token })
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message));
  }, [token, channel, status]);

  return (
    <div className="container">
      <h1>Notifications</h1>

      <div className="toolbar">
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p className="auth-subtext">No notifications found for this filter.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Message</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.eventType.replace(/_/g, " ")}</td>
                  <td>{item.channel.toUpperCase()}</td>
                  <td>
                    <span className={`vehicle-pill ${item.status === "sent" ? "pill-ok" : "pill-bad"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.message}</td>
                  <td>{item.error || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
