const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const MagicFixMessage = new Schema(
  {
    message_id:{
        type:String,
        required: true
    },
    user_id:{
        type:String,
        required: true
    },
    message:{
        type:String,
        required: true
    },
    responder:{
        type:String,
        required: true,
        enum:[ "user", "ai", "assistant" ]
    },
    linked_message_id:{
        type:String,
        required: false
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

module.exports = mongoose.model("devsensor-magic-fix-message-schema", MagicFixMessage);
