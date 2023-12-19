const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const CustomError = require("../utils/custom-error");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const WokroutAI = require("../utils/ai/workout.ai");

class Excerise {
    
  async createWorkouts(data) {
    const { user_id, postures } = data;
    console.log({ postures });
    const { lastWorkoutDate, lastWorkoutSent } = await this.lastWorkoutDate(
      user_id
    );
    const data_ = {
      ...data,
      difficultyLevel: "",
      lastWorkoutDate,
      lastWorkoutSent,
    };
    const generatedWorkout = await WokroutAI.generateWorkout(data_);
    if (!generatedWorkout)
      throw new CustomError("Unable to generate workout.", 400);
    return generatedWorkout;
  }
  async getWorkouts() {
    const workouts = await Workout.find({});
    return workouts;
  }
  async getWorkout(user_id) {
    if (!user_id) throw new CustomError("Please provide a user id", 400);
    const workouts = await Workout.findOne({ user_id });
    return workouts;
  }

  async lastWorkoutDate(user_id) {
    const workouts = await Workout.find({ user_id });
    const lastWorkoutDate = (await Workout.findOne({ user_id }).sort({ date: -1 })).date;
    const lastWorkoutSent = (await Workout.findOne({ user_id }).sort({ date: -1 }));
    return { lastWorkoutDate, lastWorkoutSent };
  }
}

module.exports = new Excerise();
