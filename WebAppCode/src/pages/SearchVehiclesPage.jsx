import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function SearchVehiclesPage() {
    const {
        vehicles,
        reserveVehicle,
        currentUser,
        logParkingAccess,
        logTransportAccess,
    } = useApp();

    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [cityFilter, setCityFilter] = useState("All");

    const cities = ["All", ...new Set(vehicles.map((v) => v.city))];

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => {
            const matchesText =
                vehicle.name.toLowerCase().includes(searchText.toLowerCase()) ||
                vehicle.type.toLowerCase().includes(searchText.toLowerCase());

            const matchesCity = cityFilter === "All" || vehicle.city === cityFilter;

            return matchesText && matchesCity;
        });
    }, [vehicles, searchText, cityFilter]);

    const handleReserve = (vehicleId) => {
        const result = reserveVehicle(vehicleId);

        if (result.success) {
            navigate("/reserve");
        }
    };

    return (
        <div className="page-grid">
            <div className="card">
                <div className="card-header">
                    <h2>Search Vehicles</h2>
                    <p className="muted">
                        Find vehicles, reserve them, and continue to payment.
                    </p>
                </div>

                {!currentUser && (
                    <p className="warning">You must log in before making a reservation.</p>
                )}

                <div className="filters">
                    <input
                        className="input"
                        type="text"
                        placeholder="Search by vehicle name or type"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <select
                        className="input"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="vehicle-grid">
                    {filteredVehicles.length === 0 ? (
                        <p className="muted">No vehicles match your search.</p>
                    ) : (
                        filteredVehicles.map((vehicle) => (
                            <div className="vehicle-card improved-card" key={vehicle.id}>
                                <div className="vehicle-image-wrap">
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.name}
                                        className="vehicle-image"
                                    />
                                </div>

                                <div className="vehicle-content">
                                    <div className="vehicle-top-row">
                                        <h3>{vehicle.name}</h3>
                                        <span className={vehicle.available ? "badge success" : "badge danger"}>
                      {vehicle.available ? "Available" : "Reserved"}
                    </span>
                                    </div>

                                    <p className="muted vehicle-subtitle">
                                        {vehicle.type} • {vehicle.city}
                                    </p>

                                    <div className="vehicle-info-row">
                                        <div className="mini-info-box">
                                            <span>Type</span>
                                            <strong>{vehicle.type}</strong>
                                        </div>

                                        <div className="mini-info-box">
                                            <span>City</span>
                                            <strong>{vehicle.city}</strong>
                                        </div>

                                        <div className="mini-info-box">
                                            <span>Price</span>
                                            <strong>${vehicle.price}</strong>
                                        </div>
                                    </div>

                                    <button
                                        className="btn primary-btn full-btn"
                                        onClick={() => handleReserve(vehicle.id)}
                                        disabled={!vehicle.available}
                                    >
                                        {vehicle.available ? "Reserve Vehicle" : "Currently Unavailable"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card side-card">
                <div className="card-header">
                    <h2>External Services</h2>
                    <p className="muted">
                        Simulated navigation to outside mobility services.
                    </p>
                </div>

                <button className="btn secondary-btn" onClick={logParkingAccess}>
                    Open Parking Service
                </button>

                <button className="btn secondary-btn" onClick={logTransportAccess}>
                    Open Public Transportation
                </button>
            </div>
        </div>
    );
}