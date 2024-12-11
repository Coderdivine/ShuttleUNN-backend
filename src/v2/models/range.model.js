const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const PoseSchema = new Schema({
  timestamp: { type: Date },
  user_id: {
    type: String,
    required: false
  },
  devsensor_id: {
    type: String,
    required: true
  },
  middle: [
    {
        from: Number,
        to: Number,
        label: String,
    }, // for all available keypoints
  ],
  right: [
    {
        from: Number,
        to: Number,
        label: String,
    }, // for all available keypoints
  ],
  left: [
    {
        from: Number,
        to: Number,
        label: String,
    }, // for all available keypoints
  ],
});

module.exports = mongoose.model("devsensor-range-schema", PoseSchema);
