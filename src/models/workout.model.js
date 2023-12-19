const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// const { BCRYPT_SALT } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Workout = new Schema({
  workout_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  workouts: [
    {
      name: String,
      description: String,
      timeRange: Number,
      media: String,
      identity: String,
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("devsensor-workout-schema", Workout);
