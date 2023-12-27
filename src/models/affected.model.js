const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const AffectedParts = new Schema(
  {
    afftected_id:{
        type:String,
        required:true,
    },
    user_id:{
      type:String,
      required: true
    },
    posture:{
      type:String,
      required:false
    },
    area:{
        type:String,
        required: true
    },
    percentage:{
        type:Number,
        required: true
    },
    date:{  
        type: Date,
        default: Date.now()
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-affected-parts-schema", AffectedParts);
