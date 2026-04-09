import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

const defaultFilters = {
  q: "",
  type: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  available: "",
  sortBy: "newest",
  page: 1,
  limit: 9
};

export default function SearchPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ items: [], meta: { total: 0, pages: 1, page: 1 } });

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    apiRequest(`/api/vehicles?${params.toString()}`)
      .then((resp) => mounted && setData(resp))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [filters]);

  const types = useMemo(() => ["", "Car", "Bike", "Scooter", "E-Bike", "SUV"], []);
  const cities = useMemo(() => ["", "Montreal", "Toronto", "Vancouver", "Calgary", "Ottawa"], []);

  return (
    <div className="container">
      <div className="toolbar">
        <input
          placeholder="Search name, type, city, address"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value, page: 1 }))}
        />
        <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}>
          {types.map((type) => <option key={type} value={type}>{type || "All types"}</option>)}
        </select>
        <select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value, page: 1 }))}>
          {cities.map((city) => <option key={city} value={city}>{city || "All cities"}</option>)}
        </select>
        <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value, page: 1 }))} />
        <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value, page: 1 }))} />
        <select value={filters.available} onChange={(e) => setFilters((p) => ({ ...p, available: e.target.value, page: 1 }))}>
          <option value="">All status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <select value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value, page: 1 }))}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price low-high</option>
          <option value="price_desc">Price high-low</option>
          <option value="name_asc">Alphabetical</option>
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="vehicle-grid vehicle-grid-premium">
            {data.items.map((vehicle) => (
              <article className="vehicle-card vehicle-card-premium" key={vehicle._id}>
                <img src={vehicle.imageUrl} alt={vehicle.name} />
                <div className="card-body card-body-premium">
                  <h3 className="vehicle-title">{vehicle.name}</h3>
                  <p className="meta-line">{vehicle.type} in {vehicle.city}</p>
                  <div className="vehicle-pill-row">
                    {vehicle.mileageKm ? <span className="vehicle-pill">{Number(vehicle.mileageKm).toLocaleString()} km</span> : null}
                    <span className={`vehicle-pill ${vehicle.available ? "pill-ok" : "pill-bad"}`}>
                      {vehicle.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="address-line">{vehicle.addressFormatted}</p>
                  <div className="vehicle-footer">
                    <p className="price">${vehicle.pricePerDay}<small>/day</small></p>
                    <Link className="btn-link btn-link-strong" to={`/vehicles/${vehicle._id}`}>View Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pager">
            <button disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>Previous</button>
            <span>Page {data.meta.page} / {Math.max(data.meta.pages, 1)}</span>
            <button disabled={filters.page >= data.meta.pages} onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
