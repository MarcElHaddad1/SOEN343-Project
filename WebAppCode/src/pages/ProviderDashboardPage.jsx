import { useState } from "react";
import { useApp } from "../context/AppContext";

const emptyForm = {
    name: "",
    type: "",
    city: "",
    price: "",
};

export default function ProviderDashboardPage() {
    const {
        currentUser,
        vehicles,
        addVehicle,
        updateVehicle,
        removeVehicle,
    } = useApp();

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name || !form.type || !form.city || !form.price) {
            return;
        }

        if (editingId) {
            updateVehicle(editingId, form);
        } else {
            addVehicle(form);
        }

        resetForm();
    };

    const handleEdit = (vehicle) => {
        setEditingId(vehicle.id);
        setForm({
            name: vehicle.name,
            type: vehicle.type,
            city: vehicle.city,
            price: String(vehicle.price),
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openDeleteConfirm = (vehicle) => {
        setDeleteTarget(vehicle);
    };

    const closeDeleteConfirm = () => {
        setDeleteTarget(null);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        removeVehicle(deleteTarget.id);
        setDeleteTarget(null);

        if (editingId === deleteTarget.id) {
            resetForm();
        }
    };

    if (!currentUser || currentUser.role !== "provider") {
        return (
            <div className="card">
                <h2>Provider Dashboard</h2>
                <p className="warning">
                    This page is for provider accounts only. Log in with a provider account.
                </p>
            </div>
        );
    }

    if (!currentUser.approved) {
        return (
            <div className="card">
                <h2>Provider Dashboard</h2>
                <p className="warning">
                    Your provider account is waiting for admin approval. Once approved, your dashboard will unlock.
                </p>
            </div>
        );
    }

    return (
        <div className="provider-layout">
            <div className="card provider-form-card">
                <div className="card-header">
                    <h2>Provider Dashboard</h2>
                    <p className="muted">
                        Add, update, and remove vehicles from the platform.
                    </p>
                </div>

                <div className="provider-mode-banner">
                    {editingId ? "Editing existing vehicle" : "Adding a new vehicle"}
                </div>

                <form onSubmit={handleSubmit} className="provider-form-grid">
                    <div className="form-group">
                        <label className="form-label">Vehicle Name</label>
                        <input
                            className="input"
                            name="name"
                            placeholder="Example: Economy Car"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vehicle Type</label>
                        <input
                            className="input"
                            name="type"
                            placeholder="Example: Car, Bike, Scooter"
                            value={form.type}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                            className="input"
                            name="city"
                            placeholder="Example: Montreal"
                            value={form.city}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price</label>
                        <input
                            className="input"
                            name="price"
                            type="number"
                            placeholder="Example: 25"
                            value={form.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="provider-form-actions">
                        <button className="btn primary-btn" type="submit">
                            {editingId ? "Update Vehicle" : "Add Vehicle"}
                        </button>

                        <button
                            className="btn secondary-btn"
                            type="button"
                            onClick={resetForm}
                        >
                            Clear Form
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Vehicle Inventory</h2>
                    <p className="muted">Manage all available platform vehicles.</p>
                </div>

                <div className="vehicle-grid">
                    {vehicles.map((vehicle) => (
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

                                <div className="vehicle-card-actions">
                                    <button
                                        className="btn secondary-btn"
                                        onClick={() => handleEdit(vehicle)}
                                    >
                                        Edit Vehicle
                                    </button>

                                    <button
                                        className="btn danger-btn"
                                        onClick={() => openDeleteConfirm(vehicle)}
                                    >
                                        Remove Vehicle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {deleteTarget && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Confirm Deletion</h3>
                        <p className="muted">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                        </p>

                        <div className="modal-actions">
                            <button className="btn secondary-btn" onClick={closeDeleteConfirm}>
                                Cancel
                            </button>
                            <button className="btn danger-btn" onClick={confirmDelete}>
                                Delete Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}