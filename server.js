const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

/* ---------------- STATIC DATA ---------------- */

let vehicles = [
    { id: 1, type: "Car", city: "Montreal", price: 20, status: "AVAILABLE" },
    { id: 2, type: "Scooter", city: "Montreal", price: 10, status: "AVAILABLE" },
    { id: 3, type: "Bike", city: "Toronto", price: 5, status: "AVAILABLE" }
];

let rentals = [];
let rentalIdCounter = 1;

let analytics = {
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0
};

/* ---------------- ROUTES ---------------- */

// Search vehicles
app.get("/vehicles", (req, res) => {
    const { city, type } = req.query;

    let results = vehicles.filter(v =>
        (!city || v.city === city) &&
        (!type || v.type === type) &&
        v.status === "AVAILABLE"
    );

    res.json(results);
});

// Reserve vehicle
app.post("/reserve/:vehicleId", (req, res) => {
    const vehicleId = parseInt(req.params.vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle || vehicle.status !== "AVAILABLE") {
        return res.status(400).json({ message: "Vehicle not available" });
    }

    vehicle.status = "RESERVED";

    const rental = {
        id: rentalIdCounter++,
        vehicleId: vehicle.id,
        status: "RESERVED"
    };

    rentals.push(rental);

    res.json({ message: "Vehicle reserved", rental });
});

// Start rental
app.post("/start/:rentalId", (req, res) => {
    const rentalId = parseInt(req.params.rentalId);
    const rental = rentals.find(r => r.id === rentalId);

    if (!rental || rental.status !== "RESERVED") {
        return res.status(400).json({ message: "Rental cannot be started" });
    }

    rental.status = "ACTIVE";
    analytics.totalRentals++;
    analytics.activeRentals++;

    res.json({ message: "Rental started", rental });
});

// End rental
app.post("/end/:rentalId", (req, res) => {
    const rentalId = parseInt(req.params.rentalId);
    const rental = rentals.find(r => r.id === rentalId);

    if (!rental || rental.status !== "ACTIVE") {
        return res.status(400).json({ message: "Rental cannot be ended" });
    }

    rental.status = "COMPLETED";

    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
    vehicle.status = "AVAILABLE";

    analytics.activeRentals--;
    analytics.completedRentals++;

    res.json({ message: "Rental completed", rental });
});

// Analytics
app.get("/analytics", (req, res) => {
    res.json(analytics);
});

app.listen(PORT, () => {
    console.log(`SUMMS demo running at http://localhost:${PORT}`);
});