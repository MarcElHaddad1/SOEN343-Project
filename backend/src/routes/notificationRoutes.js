import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/my", authRequired, async (req, res) => {
  const { channel = "all", status = "all" } = req.query;
  const filter = { userId: req.auth.sub };

  if (channel !== "all") {
    filter.channel = channel;
  }

  if (status !== "all") {
    filter.status = status;
  }

  const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(300);
  return res.json({ items });
});

export default router;
