const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// const { BCRYPT_SALT } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Posture = new Schema(
  {
    posture_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    devsensor_id: {
      type: String,
      required: true,
    },
    posture_name: {
      type: String,
      required: true,
    },
    posture_accuracy: {
      type: String,
      required: true,
    },
    posture_rate: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    lastPosture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "devsensor-user-posture-schema",
    },
  },
  {
    timestamps: true,
  }
);

Posture.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const lastPosture = await this.constructor
      .findOne({ devsensor_id: this.devsensor_id })
      .sort({ date: -1 });

    if (lastPosture) {
      this.lastPosture = lastPosture.posture_id;
    }

    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("devsensor-user-posture-schema", Posture);
