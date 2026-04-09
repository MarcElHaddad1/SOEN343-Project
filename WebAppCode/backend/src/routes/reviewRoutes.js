import express from "express";
import mongoose from "mongoose";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Review } from "../models/Review.js";
import { Booking } from "../models/Booking.js";
import { Vehicle } from "../models/Vehicle.js";

const router = express.Router();

/**
 * GET /api/reviews/vehicle/:vehicleId
 * Public — returns all reviews for a vehicle with average rating.
 */
router.get("/vehicle/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    return res.status(400).json({ message: "Invalid vehicle id" });
  }

  const reviews = await Review.find({ vehicleId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return res.json({
    reviews,
    avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
    count: reviews.length
  });
});

/**
 * GET /api/reviews/my
 * Customer — returns all reviews written by the current user.
 */
router.get("/my", authRequired, requireRole("customer"), async (req, res) => {
  const reviews = await Review.find({ userId: req.auth.sub })
    .populate("vehicleId", "name type city imageUrl")
    .sort({ createdAt: -1 });

  return res.json({ reviews });
});

/**
 * POST /api/reviews
 * Customer — submit a review for a completed booking.
 *
 * Rules:
 *  - Booking must belong to the current user
 *  - Booking must have status "completed"
 *  - One review per booking (enforced by unique index on bookingId)
 */
router.post("/", authRequired, requireRole("customer"), async (req, res) => {
  const { bookingId, rating, comment = "" } = req.body;

  if (!bookingId || rating === undefined) {
    return res.status(400).json({ message: "bookingId and rating are required" });
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
  }

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId" });
  }

  const booking = await Booking.findOne({ _id: bookingId, userId: req.auth.sub });
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.status !== "completed") {
    return res.status(409).json({ message: "You can only review a completed booking" });
  }

  // Check for duplicate (readable error — unique index is the hard guard)
  const existing = await Review.findOne({ bookingId });
  if (existing) {
    return res.status(409).json({ message: "You have already reviewed this booking" });
  }

  const review = await Review.create({
    vehicleId: booking.vehicleId,
    userId: req.auth.sub,
    bookingId,
    rating: parsedRating,
    comment: comment.trim()
  });

  // Update vehicle's cached avgRating for fast reads on listing cards
  const agg = await Review.aggregate([
    { $match: { vehicleId: booking.vehicleId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  if (agg.length > 0) {
    await Vehicle.findByIdAndUpdate(booking.vehicleId, {
      avgRating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count
    });
  }

  return res.status(201).json({ review });
});

/**
 * PATCH /api/reviews/:reviewId
 * Customer — edit their own review (rating + comment).
 */
router.patch("/:reviewId", authRequired, requireRole("customer"), async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    userId: req.auth.sub
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (req.body.rating !== undefined) {
    const parsedRating = Number(req.body.rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }
    review.rating = parsedRating;
  }

  if (req.body.comment !== undefined) {
    review.comment = String(req.body.comment).trim().slice(0, 1000);
  }

  await review.save();

  // Recalculate vehicle average
  const agg = await Review.aggregate([
    { $match: { vehicleId: review.vehicleId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  if (agg.length > 0) {
    await Vehicle.findByIdAndUpdate(review.vehicleId, {
      avgRating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count
    });
  }

  return res.json({ review });
});

/**
 * DELETE /api/reviews/:reviewId
 * Customer — delete their own review.
 */
router.delete("/:reviewId", authRequired, requireRole("customer"), async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    userId: req.auth.sub
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const { vehicleId } = review;
  await review.deleteOne();

  // Recalculate vehicle average
  const agg = await Review.aggregate([
    { $match: { vehicleId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  await Vehicle.findByIdAndUpdate(vehicleId, {
    avgRating: agg.length > 0 ? Math.round(agg[0].avg * 10) / 10 : null,
    reviewCount: agg.length > 0 ? agg[0].count : 0
  });

  return res.json({ message: "Review deleted" });
});

export default router;
