import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReviewSection from "../components/ReviewSection";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    apiRequest(`/api/vehicles/${id}`).then((data) => setVehicle(data.vehicle));
  }, [id]);

  if (!vehicle) return <div className="container">Loading...</div>;

  const hasUserAddress =
    user?.addressLat !== undefined &&
    user?.addressLng !== undefined &&
    user?.addressLat !== null &&
    user?.addressLng !== null &&
    user?.addressLat !== "" &&
    user?.addressLng !== "";

  const mapSrc = hasUserAddress
    ? `https://www.google.com/maps?saddr=${user.addressLat},${user.addressLng}&daddr=${vehicle.lat},${vehicle.lng}&output=embed`
    : `https://www.google.com/maps?q=${vehicle.lat},${vehicle.lng}&z=15&output=embed`;
  const canBook = user?.role === "customer";

  return (
    <div className="container details">
      <Link className="back-link" to="/search">Back to Search</Link>

      <section className="details-grid">
        <article className="details-card">
          <img className="hero hero-framed" src={vehicle.imageUrl} alt={vehicle.name} />
          <div className="details-content">
            <div className="booking-header">
              <h1>{vehicle.name}</h1>
              <span className={`vehicle-pill ${vehicle.available ? "pill-ok" : "pill-bad"}`}>
                {vehicle.available ? "Available" : "Unavailable"}
              </span>
            </div>
            <p className="meta-line">{vehicle.type} in {vehicle.city}</p>
            {vehicle.mileageKm ? <p className="meta-line">{Number(vehicle.mileageKm).toLocaleString()} km</p> : null}
            <p className="address-line">{vehicle.addressFormatted}</p>
            <p className="meta-line">Provider: {vehicle.providerId?.name} ({vehicle.providerId?.email})</p>
            {vehicle.avgRating && (
              <p className="meta-line review-inline">
                {"★".repeat(Math.round(vehicle.avgRating))}{"☆".repeat(5 - Math.round(vehicle.avgRating))}
                {" "}<strong>{vehicle.avgRating}</strong>
                <span className="review-count"> ({vehicle.reviewCount} review{vehicle.reviewCount !== 1 ? "s" : ""})</span>
              </p>
            )}
            <div className="vehicle-footer">
              <p className="price">${vehicle.pricePerDay}<small>/day</small></p>
              <button className="return-btn" disabled={!vehicle.available || !canBook} onClick={() => navigate(`/checkout/${vehicle._id}`)}>
                {!canBook ? "Customers Only" : vehicle.available ? "Book Now" : "Unavailable"}
              </button>
            </div>
          </div>
        </article>

        <article className="details-card map-card">
          <h3>{hasUserAddress ? "Route To Vehicle" : "Vehicle Location"}</h3>
          <iframe
            title="vehicle-map"
            className="map map-framed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
          />
        </article>
      </section>

      <ReviewSection vehicleId={vehicle._id} />
    </div>
  );
}
