const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const ShuttleSchema = new Schema(
  {
    shuttle_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    currentPassengers: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
    },
    assignedDriver: {
      type: String,
      ref: "Driver",
      default: null,
    },
    assignedRoutes: [
      {
        type: String,
        ref: "Route",
      },
    ],
    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      lastUpdated: {
        type: Date,
        default: null,
      },
    },
    currentRoute: {
      type: String,
      ref: "Route",
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "in-transit", "maintenance", "offline"],
      default: "offline",
    },
    maintenanceSchedule: [
      {
        scheduledDate: {
          type: Date,
        },
        reason: {
          type: String,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalDistance: {
      type: Number,
      default: 0,
      description: "Total distance traveled in kilometers",
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "shuttles",
  }
);

module.exports = mongoose.model("Shuttle", ShuttleSchema);
