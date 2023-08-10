const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");

class UserService {

  async getWorkouts(){
    try {
       const workouts = await Workout.find({});
       return workouts;
    } catch (error) {
      throw new CustomError("An issue has arisen. Please try again later.",500);
    }
  }

  async getWorkout( workout_id ){
    try {
        const workout = await Workout.findOne({ workout_id });
        if(!workout) throw new CustomError("This workout no longer exists.",400);
        return workout;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async addWorkout(data){
    try {
      if (!data)
        throw new CustomError(
          "No data passed.",
          400
        );

        const newWorkout = new Workout({
            workout_id:uuid.v4().toString(),
            title:data.title,
            description:data.description,
            image:data.image,
            workouts:data.workouts
        });

        const saved = await newWorkout.save();
        return saved;

    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async deleteWorkout(workout_id) {
    const dlt = await Workout.deleteMany({ workout_id });
    return dlt;
  }

  async updateWorkout(workout_id, data) {
      try {
        const workout = await Workout.updateOne({ workout_id }, { $set: data });
        if (!workout) throw new CustomError("Workout does not exist.", 404);
        return workout;
      } catch (error) {
         throw new CustomError("An issue has arisen, Please try again later",500);
      }
  }

  async saveWorkout(user_id, { workout_id, title, description, timeRange, media }) {
    try {

      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );

      const toSaveWorkout = {
          workout_id,
          title,
          timeRange,
          description,
          media
      };

      const saved = await User.updateOne(
        { user_id: user_id },
        { $push: { savedWorkout: toSaveWorkout } }
      );

      return saved;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async addNewWorkoutInWorkouts(workout_id, { description, timeRange, media, name }){
    try {
      const newWorkout = {
        identity:uuid.v4().toString(),
        name,
        description,
        timeRange,
        media,
      };

      const saved = await Workout.updateOne(
        { workout_id: workout_id },
        { $push: { workouts: newWorkout } }
      );

      return saved;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async editWorkoutInWorkouts(workout_id, identity, updatedValue, updatedField) {
    try {
      if (!workout_id)
        throw new CustomError(
          "Workout does not exist.",
          400
        );

        const updateQuery = {};
        updateQuery[`dailyRoutine.$.${updatedField}`] = updatedValue;

        const edited = await Workout.updateOne(
        { workout_id: workout_id, 'workouts.identity': identity },
        { $set: updateQuery }
        )
        return edited;

    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async deleteFromWorkoutInWorkouts(workout_id, identity) {
    try {
      if (!workout_id)
        throw new CustomError(
          "Workout does not exist",
          400
        );
        
        const deleted = await Workout.updateOne(
        { workout_id: workout_id },
        { $pull: { workouts: { identity: identity } } }
        )

        return deleted;

    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }


}

module.exports = new UserService();
