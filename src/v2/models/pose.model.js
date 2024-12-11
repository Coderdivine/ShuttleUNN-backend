const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const PoseSchema = new Schema({
  timestamp: { type: Date, default: Date.now() },
  keypoints: [
      {
          x: Number,
          y: Number, 
          angle: Number, 
          label: String
      },
  ],
  user_id: {
    type: String,
    required: false
  },
  devsensor_id: {
    type: String,
    required: true
  },
  isDuplicate: { type: Boolean, default: false },
  duplicateTimestamps: [Date],
});

module.exports = mongoose.model("devsensor-pose-schema", PoseSchema);
