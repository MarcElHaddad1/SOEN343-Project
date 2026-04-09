import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminStatsPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState("providers");
  const [metrics, setMetrics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/api/admin/stats", { token }),
      apiRequest("/api/admin/providers", { token }),
      apiRequest("/api/admin/users", { token })
    ])
      .then(([statsRes, providersRes, usersRes]) => {
        setMetrics(statsRes.metrics);
        setProviders(providersRes.providers || []);
        setUsers(usersRes.users || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const providerRows = useMemo(() => providers.map((p) => ({
    id: p._id,
    name: p.name,
    email: p.email,
    phone: p.phone || "-",
    status: p.approved ? "Approved" : p.rejected ? "Rejected" : "Pending",
    joined: new Date(p.createdAt).toLocaleString()
  })), [providers]);

  const derived = useMemo(() => {
    if (!metrics) return null;
    const approvalRate = metrics.providersTotal ? (metrics.providersApproved / metrics.providersTotal) * 100 : 0;
    const completionRate = metrics.bookingsTotal ? (metrics.bookingsCompleted / metrics.bookingsTotal) * 100 : 0;
    const vehicleUtilization = metrics.vehiclesTotal ? ((metrics.vehiclesTotal - metrics.vehiclesAvailable) / metrics.vehiclesTotal) * 100 : 0;
    const paymentSuccessRate = metrics.bookingsTotal ? (metrics.totalPayments / metrics.bookingsTotal) * 100 : 0;

    return {
      approvalRate,
      completionRate,
      vehicleUtilization,
      paymentSuccessRate
    };
  }, [metrics]);

  return (
    <div className="container">
      <h1>Admin Stats</h1>
      {error && <p className="error">{error}</p>}

      {metrics && (
        <>
          <div className="stats-grid">
            <article className="stat-card"><span>Total Users</span><strong>{metrics.usersTotal}</strong></article>
            <article className="stat-card"><span>Customers</span><strong>{metrics.customersTotal}</strong></article>
            <article className="stat-card"><span>Providers</span><strong>{metrics.providersTotal}</strong></article>
            <article className="stat-card"><span>Approved Providers</span><strong>{metrics.providersApproved}</strong></article>
            <article className="stat-card"><span>Pending Providers</span><strong>{metrics.providersPending}</strong></article>
            <article className="stat-card"><span>Rejected Providers</span><strong>{metrics.providersRejected}</strong></article>
            <article className="stat-card"><span>Total Vehicles</span><strong>{metrics.vehiclesTotal}</strong></article>
            <article className="stat-card"><span>Available Vehicles</span><strong>{metrics.vehiclesAvailable}</strong></article>
            <article className="stat-card"><span>Total Bookings</span><strong>{metrics.bookingsTotal}</strong></article>
            <article className="stat-card"><span>Completed Bookings</span><strong>{metrics.bookingsCompleted}</strong></article>
            <article className="stat-card"><span>Payments Succeeded</span><strong>{metrics.totalPayments}</strong></article>
            <article className="stat-card"><span>Total Revenue</span><strong>${Number(metrics.totalRevenue || 0).toFixed(2)}</strong></article>
            <article className="stat-card"><span>Parking Spots</span><strong>{metrics.parkingSpotsTotal || 0}</strong></article>
            <article className="stat-card"><span>Parking Spots Available</span><strong>{metrics.parkingSpotsAvailable || 0}</strong></article>
            <article className="stat-card"><span>Parking Reservations</span><strong>{metrics.parkingReservationsTotal || 0}</strong></article>
            <article className="stat-card"><span>Bicycles Currently Rented</span><strong>{metrics.bikesCurrentlyRented || 0}</strong></article>
            <article className="stat-card"><span>Scooters Currently Available</span><strong>{metrics.scootersCurrentlyAvailable || 0}</strong></article>
            <article className="stat-card"><span>Trips Completed Today</span><strong>{metrics.tripsCompletedToday || 0}</strong></article>
            <article className="stat-card"><span>Most Used Mobility</span><strong>{metrics.mobilityUsage?.mostUsedMobilityOption || "-"}</strong></article>
          </div>

          {derived && (
            <div className="kpi-strip">
              <span>Provider Approval Rate: <strong>{derived.approvalRate.toFixed(1)}%</strong></span>
              <span>Booking Completion Rate: <strong>{derived.completionRate.toFixed(1)}%</strong></span>
              <span>Vehicle Utilization: <strong>{derived.vehicleUtilization.toFixed(1)}%</strong></span>
              <span>Payment Success Rate: <strong>{derived.paymentSuccessRate.toFixed(1)}%</strong></span>
            </div>
          )}

          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Active Parking Reservations</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.parkingReservedByCity || []).length === 0 ? (
                  <tr><td colSpan={2}>No active parking reservations by city.</td></tr>
                ) : (metrics.parkingReservedByCity || []).map((item) => (
                  <tr key={item.city}>
                    <td>{item.city}</td>
                    <td>{item.activeReservations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mobility Type</th>
                  <th>Total Trips</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bike</td>
                  <td>{metrics.mobilityUsage?.bikeTrips || 0}</td>
                </tr>
                <tr>
                  <td>Scooter</td>
                  <td>{metrics.mobilityUsage?.scooterTrips || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Active Rentals</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.activeRentalsByCity || []).length === 0 ? (
                  <tr><td colSpan={2}>No active rentals by city.</td></tr>
                ) : (metrics.activeRentalsByCity || []).map((item) => (
                  <tr key={item.city}>
                    <td>{item.city}</td>
                    <td>{item.activeRentals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Total Trips</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.usagePerCity || []).length === 0 ? (
                  <tr><td colSpan={2}>No trip usage by city yet.</td></tr>
                ) : (metrics.usagePerCity || []).map((item) => (
                  <tr key={item.city}>
                    <td>{item.city}</td>
                    <td>{item.trips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Reserved Capacity</th>
                  <th>Total Capacity</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.parkingUtilizationByCity || []).length === 0 ? (
                  <tr><td colSpan={4}>No parking capacity data by city.</td></tr>
                ) : (metrics.parkingUtilizationByCity || []).map((item) => (
                  <tr key={item.city}>
                    <td>{item.city}</td>
                    <td>{item.reservedCapacity}</td>
                    <td>{item.totalCapacity}</td>
                    <td>{Number(item.utilizationPct || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="tab-row">
        <button className={tab === "providers" ? "tab-btn active-tab" : "tab-btn"} onClick={() => setTab("providers")}>Providers</button>
        <button className={tab === "users" ? "tab-btn active-tab" : "tab-btn"} onClick={() => setTab("users")}>Users</button>
      </div>

      {tab === "providers" ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {providerRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>
                    <span className={`vehicle-pill ${row.status === "Approved" ? "pill-ok" : row.status === "Rejected" ? "pill-bad" : ""}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "-"}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
