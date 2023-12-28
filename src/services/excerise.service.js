const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const CustomError = require("../utils/custom-error");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const WokroutAI = require("../utils/ai/workout.ai");
const Excerise = require("../models/excerise.model");

class Exercise {

  async getWorkouts() {
    return await Workout.find({});
  }

  async getWorkoutByUser_id(user_id) {
    if (!user_id)
      throw new CustomError("Please provide a user id", 400);

    return await Excerise.find({ user_id }).sort({ date: -1 }).limit(6);
  }

  async getWorkout(excerise_id) {
    if (!excerise_id)
      throw new CustomError("Please provide a excerise_id", 400);

    return (await Excerise.findOne({ excerise_id }) )|| {};
  }

  async getLastWorkoutDetails(user_id) {
    const lastWorkout = await Workout.findOne({ user_id }).sort({ date: -1 });
    
    return {
      lastWorkoutDate: lastWorkout.date,
      lastWorkoutSent: lastWorkout,
    };
  }
}


module.exports = new Exercise();
