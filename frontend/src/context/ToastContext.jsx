<<<<<<< HEAD
import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 2600);
  }

  const value = useMemo(() => ({ toast, showToast }), [toast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
=======
import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 2600);
  }

  const value = useMemo(() => ({ toast, showToast }), [toast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
>>>>>>> Testing
}
