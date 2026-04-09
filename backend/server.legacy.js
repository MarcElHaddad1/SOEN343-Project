import express from "express";
import cors from "cors";
import twilio from "twilio";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

// ===== TWILIO =====
const client = twilio(
    "AC1dc97bc1efbd8728779b6e4dd40f8d02",
    "acb539dab82531d215d58e863deae6eb"
);

const TWILIO_NUMBER = "+14385339599";

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kijijibumper@gmail.com",
        pass: "rvlswmohpmounzbj",
    },
});

// ===== SMS =====
app.post("/send-sms", async (req, res) => {
    const { phone, message } = req.body;

    try {
        await client.messages.create({
            body: message,
            from: TWILIO_NUMBER,
            to: phone,
        });

        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});

// ===== EMAIL (NO PDF) =====
app.post("/send-invoice", async (req, res) => {
    const { email, details } = req.body;

    try {
        await transporter.sendMail({
            from: "kijijibumper@gmail.com",
            to: email,
            subject: "Your Reservation Invoice",
            text: `
Reservation Invoice

Customer: ${details.name}
Vehicle: ${details.vehicle}
City: ${details.city}
Amount: $${details.amount}
Status: Paid

Date: ${new Date().toLocaleString()}

Thank you for your reservation.
            `,
        });

        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});