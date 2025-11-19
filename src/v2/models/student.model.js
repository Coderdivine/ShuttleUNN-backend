const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    student_id: {
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
    regNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    nfcCardId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
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
    collection: "students",
  }
);

module.exports = mongoose.model("Student", StudentSchema);
