const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Notification = new Schema({
  notification_id: {
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
  lastNotification:{
    type:String,
    requied: false
  },
  image: {
    type: String,
    default: "",
  },
  type:{
    type: String,
    enum: [ "workout","warning","alert", "combined" ],
    required:true
  },
  nextNotification:{
    type:Date,
    required: true
  },
  isRead:{
    type:Boolean,
    default: false
  },
  read_date:{
    type:Date,
    default: Date.now()
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("devsensor-notification-schema", Notification);
