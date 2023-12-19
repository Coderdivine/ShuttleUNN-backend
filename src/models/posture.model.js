const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Posture = new Schema(
  {
    posture_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    devsensor_id: {
      type: String,
      required: true,
    },
    posture_name: {
      type: String,
      required: true,
    },
    posture_accuracy: {
      type: Number,
      required: true,
    },
    posture_rate: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    lastPosture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "devsensor-user-posture-schema",
    },
    camera_resolution:{
      type:String,
      required: true
    },
    deviceX:{
      type:String,
      required: true 
    },
    deviceY:{
      type:String,
      required: true
    },
    normalizedX:{
      type:Number,
      required: true
    },
    normalizedY:{
      type:String,
      required: true
    },
    height:{
      type:String,
      required: true 
    },
    width:{
      type:String,
      required: true
    },
    trackInterval:{
      type:Number,
      required: true
    },
    deviceType:{
      type:String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

Posture.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const lastPosture = await this.constructor
      .findOne({ devsensor_id: this.devsensor_id })
      .sort({ date: -1 });

    if (lastPosture) {
      this.lastPosture = lastPosture.posture_id;
    }

    next();
  } catch (error) {
    console.log({ "PreSave Error":error })
    return next(error);
  }
})


module.exports = mongoose.model("devsensor-user-posture-schema", Posture);
