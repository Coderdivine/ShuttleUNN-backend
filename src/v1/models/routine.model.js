const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Routines = new Schema(
  {
    routines_id: {
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
    name:{
        type:String,
        required: true
    },
    routine:{
        type:String,
        required: true
    },
    scheduled_dates:{
        type:[Date],
        required: true
    },
    actions:{
        type:String,
        enum:[ "sport", "workout", "reminder" ],
        required: true
    },
    nestedWith:{
        type:[String],
        default:null 
    },
    disabled:{
        type:Boolean,
        default:false 
    },
    routineSent:{
        type:[Array],
        default: false
    }
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("devsensor-user-routines-schema", Routines);
