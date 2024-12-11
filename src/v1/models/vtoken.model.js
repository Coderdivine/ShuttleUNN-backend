const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// const { BCRYPT_SALT } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const VToken = new Schema(
    {
        email:{
            type: String,
            required: true,
        },
        hashedOtp:{
            type:String,
            required:true
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("devsensor-vtoken-schema", VToken);