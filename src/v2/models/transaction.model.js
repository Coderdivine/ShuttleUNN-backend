const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    transaction_id: {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["topup", "debit", "refund"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "phone", "qrcode", "transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    booking_id: {
      type: String,
      ref: "Booking",
      default: null,
    },
    previousBalance: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
