import { useApp } from "../context/AppContext";

export default function AnalyticsPage() {
    const { analytics, reservations, vehicles } = useApp();

    const rentalsByCity = reservations.reduce((acc, reservation) => {
        acc[reservation.city] = (acc[reservation.city] || 0) + 1;
        return acc;
    }, {});

    const rentalsByType = reservations.reduce((acc, reservation) => {
        acc[reservation.type] = (acc[reservation.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="analytics-layout">
            <div className="card">
                <h2>Analytics Dashboard</h2>
                <p className="muted">Basic proof-of-concept analytics.</p>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span>Total Vehicles</span>
                        <strong>{vehicles.length}</strong>
                    </div>

                    <div className="stat-box">
                        <span>Total Reservations</span>
                        <strong>{analytics.totalReservations}</strong>
                    </div>

                    <div className="stat-box">
                        <span>Total Payments</span>
                        <strong>{analytics.totalPayments}</strong>
                    </div>

                    <div className="stat-box">
                        <span>Total Returns</span>
                        <strong>{analytics.totalReturns}</strong>
                    </div>

                    <div className="stat-box">
                        <span>Parking Accesses</span>
                        <strong>{analytics.parkingAccessCount}</strong>
                    </div>

                    <div className="stat-box">
                        <span>Public Transport Accesses</span>
                        <strong>{analytics.transportAccessCount}</strong>
                    </div>
                </div>
            </div>

            <div className="page-grid">
                <div className="card">
                    <h2>Rentals by City</h2>
                    {Object.keys(rentalsByCity).length === 0 ? (
                        <p className="muted">No rental data yet.</p>
                    ) : (
                        <div className="simple-list">
                            {Object.entries(rentalsByCity).map(([city, count]) => (
                                <div className="list-row" key={city}>
                                    <span>{city}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2>Rentals by Mobility Type</h2>
                    {Object.keys(rentalsByType).length === 0 ? (
                        <p className="muted">No rental data yet.</p>
                    ) : (
                        <div className="simple-list">
                            {Object.entries(rentalsByType).map(([type, count]) => (
                                <div className="list-row" key={type}>
                                    <span>{type}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}