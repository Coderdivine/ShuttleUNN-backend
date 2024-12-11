const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const DeviceSchema = new Schema(
  {

    user_id:{
        type:String,
        required:true,
    },
    devsensor_id:{
      type:String,
      default:uuid.v4()
    },
    wifi_strength:{
        type:Number,
        default:0
    },
    battery_health:{
        type:Number,
        default:100
    },
    battery_level:{
        type:Number,
        default:100
    },
    device_health:{
        type:Number,
        default:100
    },
    device_memory:{
        type:String,
        default:"4MB"
    },
    device_age:{
        type:Date,
        default:Date.now()
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-device-schema", DeviceSchema);
