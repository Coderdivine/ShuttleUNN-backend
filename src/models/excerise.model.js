const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Excerise = new Schema({
  excerise_id: {
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
  notification_text:{
    type: String,
    required: true
  },
  posture_csv:{
    type:String,
    required: true  
  },
  duration:{
    type:String,
    required: true
  },
  previousWorkout:{
    type:String,
    requied: false
  },
  image: {
    type: String,
    default: "",
  },
  instruction: {
    type:String,
    required: true
  },
  difficultyLevel:{
    type:String,
    enum:["easy","soft","hard"],
    default: "easy"
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("devsensor-excerise-schema", Excerise);
