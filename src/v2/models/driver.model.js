const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const DriverSchema = new Schema(
  {
    driver_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    license: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    vehicleInfo: {
      registrationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
      },
      make: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      capacity: {
        type: Number,
        required: true,
        min: 1,
      },
      color: {
        type: String,
        trim: true,
      },
    },
    assignedRoutes: [
      {
        route_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Route",
        },
      },
    ],
    assignedRoute: {
      type: String,
      trim: true,
      default: null,
    },
    bankDetails: {
      accountName: {
        type: String,
        trim: true,
        default: null,
      },
      accountNumber: {
        type: String,
        trim: true,
        default: null,
      },
      bankName: {
        type: String,
        trim: true,
        default: null,
      },
      bankCode: {
        type: String,
        trim: true,
        default: null,
      },
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-break", "offline"],
      default: "inactive",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "drivers",
    toJSON: {
      transform: function(doc, ret) {
        // Add plateNumber as an alias for registrationNumber in vehicleInfo
        if (ret.vehicleInfo && ret.vehicleInfo.registrationNumber) {
          ret.vehicleInfo.plateNumber = ret.vehicleInfo.registrationNumber;
        }
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Driver", DriverSchema);
