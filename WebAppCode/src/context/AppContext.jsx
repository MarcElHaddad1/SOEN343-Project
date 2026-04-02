/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AppContext = createContext();

const vehicleImages = ["/pic1.webp", "/pic2.webp"];

const pickRandomVehicleImage = () => {
    const randomIndex = Math.floor(Math.random() * vehicleImages.length);
    return vehicleImages[randomIndex];
};

const normalizeVehicle = (vehicle) => ({
    ...vehicle,
    image: vehicle.image || pickRandomVehicleImage(),
    price: Number(vehicle.price),
    available:
        typeof vehicle.available === "boolean" ? vehicle.available : true,
});

const starterVehicles = [
    {
        id: 1,
        name: "Electric Scooter",
        type: "Scooter",
        city: "Montreal",
        price: 12,
        available: true,
        image: pickRandomVehicleImage(),
    },
    {
        id: 2,
        name: "City Bike",
        type: "Bike",
        city: "Montreal",
        price: 8,
        available: true,
        image: pickRandomVehicleImage(),
    },
    {
        id: 3,
        name: "Compact Car",
        type: "Car",
        city: "Laval",
        price: 45,
        available: true,
        image: pickRandomVehicleImage(),
    },
    {
        id: 4,
        name: "E-Bike",
        type: "Bike",
        city: "Longueuil",
        price: 15,
        available: true,
        image: pickRandomVehicleImage(),
    },
];

const hardcodedAdmin = {
    id: "admin-fixed",
    name: "Administrator",
    email: "admin",
    password: "admin",
    role: "admin",
    approved: true,
};

export function AppProvider({ children }) {
    const toastTimerRef = useRef(null);

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem("users");
        return saved ? JSON.parse(saved) : [];
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem("currentUser");
        return saved ? JSON.parse(saved) : null;
    });

    const [vehicles, setVehicles] = useState(() => {
        const saved = localStorage.getItem("vehicles");
        const parsed = saved ? JSON.parse(saved) : starterVehicles;
        return parsed.map(normalizeVehicle);
    });

    const [reservations, setReservations] = useState(() => {
        const saved = localStorage.getItem("reservations");
        return saved ? JSON.parse(saved) : [];
    });

    const [analytics, setAnalytics] = useState(() => {
        const saved = localStorage.getItem("analytics");
        return saved
            ? JSON.parse(saved)
            : {
                totalReservations: 0,
                totalPayments: 0,
                totalReturns: 0,
                parkingAccessCount: 0,
                transportAccessCount: 0,
            };
    });

    const [toast, setToast] = useState({
        show: false,
        text: "",
        type: "success",
    });

    useEffect(() => {
        localStorage.setItem("users", JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem("vehicles", JSON.stringify(vehicles));
    }, [vehicles]);

    useEffect(() => {
        localStorage.setItem("reservations", JSON.stringify(reservations));
    }, [reservations]);

    useEffect(() => {
        localStorage.setItem("analytics", JSON.stringify(analytics));
    }, [analytics]);

    const showToast = (text, type = "success") => {
        setToast({
            show: true,
            text,
            type,
        });

        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = setTimeout(() => {
            setToast({
                show: false,
                text: "",
                type: "success",
            });
        }, 2200);
    };

    const sendSMS = async (phone, message) => {
        if (!phone) return;

        try {
            await fetch("http://localhost:5000/send-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, message }),
            });
        } catch (error) {
            console.error("SMS send failed:", error);
        }
    };

    const sendInvoiceEmail = async (email, details) => {
        if (!email) return;

        try {
            await fetch("http://localhost:5000/send-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, details }),
            });
        } catch (error) {
            console.error("Invoice email failed:", error);
        }
    };

    const register = (name, email, password, role, phone) => {
        const exists = users.some(
            (user) => user.email.toLowerCase() === email.toLowerCase()
        );

        if (exists || email.toLowerCase() === "admin") {
            showToast("Email already exists.", "error");
            return { success: false, message: "Email already exists." };
        }

        const isProvider = role === "provider";

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
            phone,
            approved: isProvider ? false : true,
        };

        setUsers((prev) => [...prev, newUser]);

        if (isProvider) {
            showToast("Provider account created. Waiting for admin approval.");
            return {
                success: true,
                message: "Provider account created. Please wait for admin approval.",
            };
        }

        showToast("Account created successfully.");
        return { success: true, message: "Account created successfully." };
    };

    const login = (email, password) => {
        if (email === "admin" && password === "admin") {
            setCurrentUser(hardcodedAdmin);
            showToast("Welcome back, Administrator.");
            return { success: true, message: "Admin login successful." };
        }

        const found = users.find(
            (user) =>
                user.email.toLowerCase() === email.toLowerCase() &&
                user.password === password
        );

        if (!found) {
            showToast("Invalid email or password.", "error");
            return { success: false, message: "Invalid email or password." };
        }

        setCurrentUser(found);

        if (found.role === "provider" && !found.approved) {
            showToast("Your provider account is waiting for admin approval.", "error");
            return {
                success: true,
                message: "Login successful, but your provider account is still waiting for approval.",
            };
        }

        showToast(`Welcome back, ${found.name}.`);
        return { success: true, message: "Login successful." };
    };

    const logout = () => {
        setCurrentUser(null);
        showToast("Logged out successfully.");
    };

    const approveProvider = (userId) => {
        let approvedUser = null;

        setUsers((prev) =>
            prev.map((user) => {
                if (user.id === userId) {
                    approvedUser = { ...user, approved: true };
                    return approvedUser;
                }
                return user;
            })
        );

        if (currentUser && currentUser.id === userId && approvedUser) {
            setCurrentUser(approvedUser);
        }

        showToast("Provider approved successfully.");
    };

    const addVehicle = (vehicle) => {
        if (!currentUser || currentUser.role !== "provider" || !currentUser.approved) {
            showToast("Only approved providers can add vehicles.", "error");
            return;
        }

        const newVehicle = normalizeVehicle({
            id: Date.now(),
            ...vehicle,
            available: true,
            image: pickRandomVehicleImage(),
            providerId: currentUser.id,
        });

        setVehicles((prev) => [...prev, newVehicle]);
        showToast("Vehicle added successfully.");
    };

    const updateVehicle = (id, updatedVehicle) => {
        if (!currentUser || currentUser.role !== "provider" || !currentUser.approved) {
            showToast("Only approved providers can update vehicles.", "error");
            return;
        }

        setVehicles((prev) =>
            prev.map((vehicle) =>
                vehicle.id === id
                    ? normalizeVehicle({
                        ...vehicle,
                        ...updatedVehicle,
                        image: vehicle.image || pickRandomVehicleImage(),
                    })
                    : vehicle
            )
        );

        showToast("Vehicle updated successfully.");
    };

    const removeVehicle = (id) => {
        if (!currentUser || currentUser.role !== "provider" || !currentUser.approved) {
            showToast("Only approved providers can remove vehicles.", "error");
            return;
        }

        setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
        showToast("Vehicle removed successfully.");
    };

    const reserveVehicle = async (vehicleId) => {
        if (!currentUser) {
            showToast("Please log in first.", "error");
            return { success: false, message: "Please log in first." };
        }

        if (currentUser.role === "provider" && !currentUser.approved) {
            showToast("Your provider account is still waiting for approval.", "error");
            return {
                success: false,
                message: "Your provider account is still waiting for approval.",
            };
        }

        const vehicle = vehicles.find((v) => v.id === vehicleId);

        if (!vehicle || !vehicle.available) {
            showToast("Vehicle not available.", "error");
            return { success: false, message: "Vehicle not available." };
        }

        const newReservation = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            type: vehicle.type,
            city: vehicle.city,
            amount: vehicle.price,
            status: "Reserved",
            paymentStatus: "Pending",
            returnStatus: "Not Returned",
            createdAt: new Date().toLocaleString(),
        };

        setReservations((prev) => [...prev, newReservation]);

        setVehicles((prev) =>
            prev.map((v) => (v.id === vehicleId ? { ...v, available: false } : v))
        );

        setAnalytics((prev) => ({
            ...prev,
            totalReservations: prev.totalReservations + 1,
        }));

        showToast("Vehicle reserved successfully.");

        await sendSMS(
            currentUser.phone,
            `Reservation Confirmed 🚗
Vehicle: ${vehicle.name}
Type: ${vehicle.type}
City: ${vehicle.city}
Amount: $${vehicle.price}
Date: ${new Date().toLocaleString()}`
        );

        return { success: true, message: "Vehicle reserved successfully." };
    };

    const payReservation = async (reservationId) => {
        const target = reservations.find((reservation) => reservation.id === reservationId);

        if (!target) {
            showToast("Reservation not found.", "error");
            return;
        }

        if (target.paymentStatus === "Paid") {
            showToast("This reservation is already paid.", "error");
            return;
        }

        setReservations((prev) =>
            prev.map((reservation) =>
                reservation.id === reservationId
                    ? { ...reservation, paymentStatus: "Paid", status: "Paid" }
                    : reservation
            )
        );

        setAnalytics((prev) => ({
            ...prev,
            totalPayments: prev.totalPayments + 1,
        }));

        showToast("Payment completed successfully.");

        await sendSMS(
            currentUser?.phone,
            `Payment Received ✅
Vehicle: ${target.vehicleName}
City: ${target.city}
Amount: $${target.amount}
Invoice sent to your email.`
        );

        await sendInvoiceEmail(currentUser?.email, {
            name: currentUser?.name,
            vehicle: target.vehicleName,
            city: target.city,
            amount: target.amount,
        });
    };

    const returnVehicle = (reservationId) => {
        const reservation = reservations.find((r) => r.id === reservationId);

        if (!reservation) {
            showToast("Reservation not found.", "error");
            return;
        }

        if (reservation.returnStatus === "Returned") {
            showToast("Vehicle already returned.", "error");
            return;
        }

        setReservations((prev) =>
            prev.map((r) =>
                r.id === reservationId
                    ? { ...r, returnStatus: "Returned", status: "Completed" }
                    : r
            )
        );

        setVehicles((prev) =>
            prev.map((v) =>
                v.id === reservation.vehicleId ? { ...v, available: true } : v
            )
        );

        setAnalytics((prev) => ({
            ...prev,
            totalReturns: prev.totalReturns + 1,
        }));

        showToast("Vehicle returned successfully.");
    };

    const logParkingAccess = () => {
        setAnalytics((prev) => ({
            ...prev,
            parkingAccessCount: prev.parkingAccessCount + 1,
        }));

        showToast("Opening parking service.");
        window.open("https://www.google.com/maps/search/parking+near+me", "_blank");
    };

    const logTransportAccess = () => {
        setAnalytics((prev) => ({
            ...prev,
            transportAccessCount: prev.transportAccessCount + 1,
        }));

        showToast("Opening public transportation service.");
        window.open("https://www.stm.info/en", "_blank");
    };

    const myReservations = useMemo(() => {
        if (!currentUser) return [];
        return reservations.filter((reservation) => reservation.userId === currentUser.id);
    }, [currentUser, reservations]);

    const pendingProviders = useMemo(() => {
        return users.filter((user) => user.role === "provider" && !user.approved);
    }, [users]);

    return (
        <AppContext.Provider
            value={{
                users,
                currentUser,
                vehicles,
                reservations,
                myReservations,
                analytics,
                toast,
                pendingProviders,
                showToast,
                register,
                login,
                logout,
                approveProvider,
                addVehicle,
                updateVehicle,
                removeVehicle,
                reserveVehicle,
                payReservation,
                returnVehicle,
                logParkingAccess,
                logTransportAccess,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}