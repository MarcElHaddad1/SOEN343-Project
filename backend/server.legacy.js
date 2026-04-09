import express from "express";
import cors from "cors";
import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== TWILIO =====
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
            from: process.env.EMAIL_USER,
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

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
