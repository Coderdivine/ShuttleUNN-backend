const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchedulerSchema = new Schema({
  timestamp: { type: Date, default: Date.now() },
  devsensor_id : { type: String, required: true },
  schedule_id: { type: String, required: true },
  user_id: { type: String, required: true },
  dateInText: { type: String, required: true },
  scheduledDate: { type: String, required: true },
  scheduledConversation: { type: String, required: true },
});


module.exports = mongoose.model("devsensor-scheduler-schema", SchedulerSchema);
