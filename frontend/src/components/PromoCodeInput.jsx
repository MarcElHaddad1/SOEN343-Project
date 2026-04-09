import { useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * PromoCodeInput
 * Lets customers enter a promo code during checkout.
 *
 * Props:
 *   amount       — original total amount in USD
 *   onApply(result) — called when a valid code is applied;
 *                     result = { code, discountedAmount, savings, discountType, discountValue }
 *   onRemove()   — called when the applied code is cleared
 */
export default function PromoCodeInput({ amount, onApply, onRemove }) {
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function validate() {
    if (!input.trim()) return;
    setError("");
    setBusy(true);
    try {
      const result = await apiRequest("/api/promos/validate", {
        method: "POST",
        token,
        body: { code: input.trim(), amount }
      });
      setApplied(result);
      onApply(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    setApplied(null);
    setInput("");
    setError("");
    onRemove();
  }

  if (applied) {
    return (
      <div className="promo-applied">
        <span className="vehicle-pill pill-ok">
          {applied.code} — saving ${applied.savings.toFixed(2)}
        </span>
        <button type="button" className="reject-btn promo-remove-btn" onClick={remove}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="promo-input-row">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder="Promo code"
        className="promo-input"
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validate())}
      />
      <button type="button" onClick={validate} disabled={busy || !input.trim()}>
        {busy ? "Checking..." : "Apply"}
      </button>
      {error && <p className="error promo-error">{error}</p>}
    </div>
  );
}
