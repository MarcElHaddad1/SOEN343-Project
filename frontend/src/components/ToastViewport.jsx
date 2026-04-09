import { useToast } from "../context/ToastContext";

export default function ToastViewport() {
  const { toast } = useToast();

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
      {toast.message}
    </div>
  );
}
