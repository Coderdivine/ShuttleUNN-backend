const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    booking_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    student_id: {
      type: String,
      ref: "Student",
      required: true,
    },
    shuttle_id: {
      type: String,
      ref: "Shuttle",
      required: true,
    },
    route_id: {
      type: String,
      ref: "Route",
      required: true,
    },
    pickupStop: {
      stop_id: {
        type: String,
        required: true,
      },
      stopName: {
        type: String,
        required: true,
      },
      pickupTime: {
        type: Date,
      },
    },
    dropoffStop: {
      stop_id: {
        type: String,
        required: true,
      },
      stopName: {
        type: String,
        required: true,
      },
      estimatedArrivalTime: {
        type: Date,
      },
      actualArrivalTime: {
        type: Date,
        default: null,
      },
    },
    bookingTime: {
      type: Date,
      default: Date.now,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
    fare: {
      type: Number,
      required: true,
      description: "Fare amount in currency units",
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "card", "phone", "qrcode", "transfer"],
      default: "wallet",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    seatNumber: {
      type: Number,
      default: null,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      feedback: {
        type: String,
        trim: true,
      },
      ratedAt: {
        type: Date,
        default: null,
      },
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true,
    },
    cancellationTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

module.exports = mongoose.model("Booking", BookingSchema);
