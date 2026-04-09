<<<<<<< HEAD
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export default function AddressAutocomplete({ value, onSelect, onChange, label = "Address" }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const query = value?.trim();
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await apiRequest(`/api/maps/autocomplete?input=${encodeURIComponent(query)}`);
        setSuggestions(data.predictions || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handlePick = async (prediction) => {
    try {
      const details = await apiRequest(`/api/maps/place/${prediction.place_id}`);
      onSelect({
        addressFormatted: details.formattedAddress,
        lat: details.lat,
        lng: details.lng
      });
      setSuggestions([]);
    } catch {
      onChange(prediction.description);
      setSuggestions([]);
    }
  };

  return (
    <div className="autocomplete">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Start typing an address" />
      {suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((item) => (
            <li key={item.place_id}>
              <button type="button" onClick={() => handlePick(item)}>
                {item.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
=======
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export default function AddressAutocomplete({ value, onSelect, onChange, label = "Address" }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const query = value?.trim();
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await apiRequest(`/api/maps/autocomplete?input=${encodeURIComponent(query)}`);
        setSuggestions(data.predictions || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handlePick = async (prediction) => {
    try {
      const details = await apiRequest(`/api/maps/place/${prediction.place_id}`);
      onSelect({
        addressFormatted: details.formattedAddress,
        lat: details.lat,
        lng: details.lng
      });
      setSuggestions([]);
    } catch {
      onChange(prediction.description);
      setSuggestions([]);
    }
  };

  return (
    <div className="autocomplete">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Start typing an address" />
      {suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((item) => (
            <li key={item.place_id}>
              <button type="button" onClick={() => handlePick(item)}>
                {item.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
>>>>>>> Testing
}
