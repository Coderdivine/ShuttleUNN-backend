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
      required: false,
    },
    posture_accuracy: {
      type: Number,
      required: false,
    },
    posture_rate: {
      type: Number,
      required: false,
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
      required: false
    },
    deviceX:{
      type:String,
      required: false 
    },
    deviceY:{
      type:String,
      required: false
    },
    normalizedX:{
      type:Number,
      required: false
    },
    normalizedY:{
      type:String,
      required: false
    },
    height:{
      type:String,
      required: false 
    },
    width:{
      type:String,
      required: false
    },
    trackInterval:{
      type:Number,
      required: true
    },
    deviceType:{
      type:String,
      required: true
    },
    isArray:{
      type:Boolean,
      default: false
    },
    posture_array: {
      type: Array,
      required: false
    },
    posture_json: {
      type: String,
      required: false
    },
    format: {
      type: String,
      enum: [ "text", "json", "csv" ],
      default: "text"
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
