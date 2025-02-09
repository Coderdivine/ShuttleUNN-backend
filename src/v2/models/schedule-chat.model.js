const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const ScheduleChat = new Schema({
  timestamp: { type: Date, default: Date.now() },
  chat_id: {
    type: String,
    required: false
  },
  user_id: {
    type: String,
    required: false
  },
  devsensor_id: {
    type: String,
    required: true
  },
  message:{
    type: String,
    required: true,
  },
  isAudio:{
    type: Boolean,
    default: false
  },
  message_id:{
    type: String,
    required: false
  },
  reply: { type: String, required: true },
  filePath: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("devsensor-schedule-chat-schema", ScheduleChat);
