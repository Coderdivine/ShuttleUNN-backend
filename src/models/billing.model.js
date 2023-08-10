const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// const { BCRYPT_SALT } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Billing = new Schema(
  {
    billing_id:{
        type:String,
        required:true,
    },
    user_id:{
        type:String,
        required:true,
    },
    plan_name:{
        type:String,
        required:true
    },
    plan_price:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    expires:{
        type:String,
        default:true 
    },
    nextBilling:{
        type:Date,
        default:Date.now()
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-user-billing-schema", Billing);
