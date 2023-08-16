const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// const { BCRYPT_SALT } = require("../config");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const UserSchema = new Schema(
  {
    user_id:{
        type:String,
        required:true,
    },
    devsensor_id:{
      type:String,
      default:uuid.v4()
    },
    username:{
      type:String,
      default:"No username"
    },
    email:{
      type:String,
      required:true
    },
    emailVerified:{
      type:Boolean,
      default:true 
    },
    isSuspended:{
      type:Boolean,
      default:false 
    },
    password:{
      type:String,
      required:true
    },
    gender:{
      type:String,
      default:"No gender"
    },
    age:{
      type:String,
      default:"No age"
    },
    occupation:{
      type:String,
      default:"No occupation"
    },
    height:{
      type:String,
      default:"No height"
    },
    weight:{
      type:String,
      default:"No weight"
    },
    dominantHand:{
      type:String,
      default:"right"
    },
    dailyRoutine:[
        {
          routine_id:String,
          routine:String,
          time:String,
          date:String,
        }
    ],
    savedWorkout:[
      {
        workout_id:{
          type:String,
          required:true
        },
        timeRange:{
          type:Number 
        },
        title:{
          type:String,
          required:true
        },
        description:{
          type:String,
          required:true
        },
        media:{
          type:String,
          required:true
        }
      }
    ],
    isLinked:{
      type:Boolean,
      default:false
    },
    track_frequency:{
        type:String,
        default:60
    },
    initialAuthentication:{
      type:String,
      default:"devsensor"
    },
    authenticatedWith:{
      type:String,
      default:"devsensor"
    },
    joined:{
      type:Date,
      default:Date.now()
    },
    lastLogin:{
      type:Date,
      default:Date.now()
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("devsensor-user-schema", UserSchema);
