const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const WaitListSchema = new Schema(
  {
    waitlist_id:{
        type:String,
        required:true,
    },
    tag:{
        type:String,
        required:false 
    },
    email:{
      type:String,
      required:true
    },
    joined:{
      type:Date,
      default:Date.now()
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-waitlist-schema", WaitListSchema);
