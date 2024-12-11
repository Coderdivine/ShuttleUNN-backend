const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { URL } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Notification = new Schema({
  notification_id: {
    type: String,
    required: true,
  },
  user_id: {
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
  link:{
    type:String,
    default:URL.DASHBOARD_URL
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
  sent:{
    type:Boolean,
    default: false
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
