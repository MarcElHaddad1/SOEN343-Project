import { useApp } from "../context/AppContext";

export default function AdminPage() {
    const { currentUser, pendingProviders, approveProvider } = useApp();

    if (!currentUser || currentUser.role !== "admin") {
        return (
            <div className="card">
                <h2>Admin Panel</h2>
                <p className="warning">
                    This page is for admin only.
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2>Admin Panel</h2>
                <p className="muted">
                    Review and approve provider accounts.
                </p>
            </div>

            {pendingProviders.length === 0 ? (
                <p className="muted">No provider accounts waiting for approval.</p>
            ) : (
                <div className="reservation-list">
                    {pendingProviders.map((provider) => (
                        <div className="reservation-card" key={provider.id}>
                            <div className="reservation-details">
                                <h3>{provider.name}</h3>
                                <p className="muted">{provider.email}</p>
                                <p>Role: {provider.role}</p>
                                <p>Status: Waiting for approval</p>
                            </div>

                            <div className="action-column">
                                <button
                                    className="btn primary-btn"
                                    onClick={() => approveProvider(provider.id)}
                                >
                                    Approve Provider
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}