import twilio from "twilio";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { Notification } from "../models/Notification.js";

const smsClient = env.twilioAccountSid && env.twilioAuthToken
  ? twilio(env.twilioAccountSid, env.twilioAuthToken)
  : null;

const emailTransporter = env.emailUser && env.emailPass
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.emailUser, pass: env.emailPass }
    })
  : null;

async function logNotification({ userId, channel, eventType, status, message, error = "" }) {
  try {
    await Notification.create({ userId, channel, eventType, status, message, error });
  } catch (err) {
    console.error("Notification log failed", err.message);
  }
}

export async function sendEventNotifications({ user, eventType, emailMessage, smsMessage }) {
  if (!user) return;

  if (emailTransporter && user.email) {
    try {
      await emailTransporter.sendMail({
        from: env.emailUser,
        to: user.email,
        subject: `Mobility Rental: ${eventType}`,
        text: emailMessage
      });

      await logNotification({
        userId: user._id,
        channel: "email",
        eventType,
        status: "sent",
        message: emailMessage
      });
    } catch (err) {
      await logNotification({
        userId: user._id,
        channel: "email",
        eventType,
        status: "failed",
        message: emailMessage,
        error: err.message
      });
    }
  }

  if (smsClient && user.phone) {
    try {
      await smsClient.messages.create({
        from: env.twilioPhoneNumber,
        to: user.phone,
        body: smsMessage
      });

      await logNotification({
        userId: user._id,
        channel: "sms",
        eventType,
        status: "sent",
        message: smsMessage
      });
    } catch (err) {
      await logNotification({
        userId: user._id,
        channel: "sms",
        eventType,
        status: "failed",
        message: smsMessage,
        error: err.message
      });
    }
  }
}
