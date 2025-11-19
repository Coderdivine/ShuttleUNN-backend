const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const RouteSchema = new Schema(
  {
    route_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    routeName: {
      type: String,
      required: true,
      trim: true,
    },
    routeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    stops: [
      {
        stop_id: {
          type: String,
          default: () => uuidv4(),
        },
        stopName: {
          type: String,
          required: true,
          trim: true,
        },
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    distance: {
      type: Number,
      required: true,
      description: "Distance in kilometers",
    },
    estimatedDuration: {
      type: Number,
      required: true,
      description: "Duration in minutes",
    },
    operatingHours: {
      startTime: {
        type: String,
        required: true,
        description: "HH:MM format",
      },
      endTime: {
        type: String,
        required: true,
        description: "HH:MM format",
      },
    },
    fare: {
      type: Number,
      required: true,
      description: "Fare in currency units",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "routes",
  }
);

module.exports = mongoose.model("Route", RouteSchema);
