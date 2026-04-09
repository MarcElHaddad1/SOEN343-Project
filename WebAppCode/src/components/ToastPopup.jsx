export default function ToastPopup({ toast }) {
    if (!toast.show) return null;

    return (
        <div className={`toast-popup ${toast.type}`}>
            <div className="toast-title">
                {toast.type === "error" ? "Action Failed" : "Success"}
            </div>
            <div className="toast-text">{toast.text}</div>
        </div>
    );
}