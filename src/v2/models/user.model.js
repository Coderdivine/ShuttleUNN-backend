const bcrypt = require("bcryptjs");
const moment = require("moment");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: "No first name",
    },
    lastName: {
      type: String,
      default: "No last name",
    },
    devsensor_id: {
      type: String,
      default: uuid.v4(),
    },
    username: {
      type: String,
      default: "No username",
    },
    email: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-user-schema", UserSchema);
