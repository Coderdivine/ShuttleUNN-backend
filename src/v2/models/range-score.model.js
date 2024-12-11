const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const RangeScoreSchema = new Schema({
  timestamp: { type: Date, default: Date.now() },
  user_id: {
    type: String,
    required: false
  },
  devsensor_id: {
    type: String,
    required: true
  },
  health: {
    type: String,
    required: true
  },
  productivity: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  guidance: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("devsensor-range-score-schema", RangeScoreSchema);
