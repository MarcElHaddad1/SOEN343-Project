import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ReservationPage() {
    const { myReservations, payReservation, returnVehicle } = useApp();

    const [confirmBox, setConfirmBox] = useState({
        open: false,
        type: "",
        reservationId: null,
        title: "",
        text: "",
    });

    const openPayConfirm = (reservationId) => {
        setConfirmBox({
            open: true,
            type: "pay",
            reservationId,
            title: "Confirm Payment",
            text: "Are you sure you want to simulate this payment?",
        });
    };

    const openReturnConfirm = (reservationId) => {
        setConfirmBox({
            open: true,
            type: "return",
            reservationId,
            title: "Confirm Return",
            text: "Are you sure you want to return this vehicle?",
        });
    };

    const closeConfirm = () => {
        setConfirmBox({
            open: false,
            type: "",
            reservationId: null,
            title: "",
            text: "",
        });
    };

    const handleConfirm = () => {
        if (confirmBox.type === "pay") {
            payReservation(confirmBox.reservationId);
        }

        if (confirmBox.type === "return") {
            returnVehicle(confirmBox.reservationId);
        }

        closeConfirm();
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2>Reservation Management</h2>
                <p className="muted">
                    Review reservations, simulate payment, and return vehicles.
                </p>
            </div>

            {myReservations.length === 0 ? (
                <p className="muted">No reservations yet.</p>
            ) : (
                <div className="reservation-list">
                    {myReservations.map((reservation) => (
                        <div className="reservation-card" key={reservation.id}>
                            <div className="reservation-details">
                                <h3>{reservation.vehicleName}</h3>
                                <p className="muted">
                                    {reservation.type} • {reservation.city}
                                </p>
                                <p>Created: {reservation.createdAt}</p>
                                <p>Reservation Status: {reservation.status}</p>
                                <p>Payment Status: {reservation.paymentStatus}</p>
                                <p>Return Status: {reservation.returnStatus}</p>
                                <p className="price">Amount: ${reservation.amount}</p>
                            </div>

                            <div className="action-column">
                                <button
                                    className="btn primary-btn"
                                    onClick={() => openPayConfirm(reservation.id)}
                                    disabled={reservation.paymentStatus === "Paid"}
                                >
                                    {reservation.paymentStatus === "Paid" ? "Payment Complete" : "Pay Now"}
                                </button>

                                <button
                                    className="btn secondary-btn"
                                    onClick={() => openReturnConfirm(reservation.id)}
                                    disabled={reservation.returnStatus === "Returned"}
                                >
                                    {reservation.returnStatus === "Returned" ? "Returned" : "Return Vehicle"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {confirmBox.open && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>{confirmBox.title}</h3>
                        <p className="muted">{confirmBox.text}</p>

                        <div className="modal-actions">
                            <button className="btn secondary-btn" onClick={closeConfirm}>
                                Cancel
                            </button>
                            <button className="btn primary-btn" onClick={handleConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}