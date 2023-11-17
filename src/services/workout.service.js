const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");

class WorkoutService {

  async getWorkouts(){
       const workouts = await Workout.find({});
       return await workouts.map((x, key)=>  x);

  }

  async getWorkout( workout_id ){
        const workout = await Workout.findOne({ workout_id });
        if(!workout) throw new CustomError("This workout no longer exists.",400);
        return workout;

  }

  async addWorkout(data){
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


  }

  async deleteWorkout(workout_id) {
    const dlt = await Workout.deleteMany({ workout_id });
    return dlt;
  }

  async updateWorkout(workout_id, data) {
          const workout = await Workout.updateOne({ workout_id }, { $set: data });
        if (!workout) throw new CustomError("Workout does not exist.", 404);
        return workout;
 
  }

  async saveWorkout(user_id, { workout_id, title, description, timeRange, media }) {

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

  }

  async addNewWorkoutInWorkouts(workout_id, { description, timeRange, media, name }){
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

  }

  async editWorkoutInWorkouts(workout_id, identity, updatedValue, updatedField) {
      if (!workout_id)
        throw new CustomError("Workout does not exist.", 400);
  
      const updateQuery = {};
      updateQuery[`workouts.$[elem].${updatedField}`] = updatedValue;
  
      const edited = await Workout.updateOne(
        { workout_id: workout_id },
        {
          $set: updateQuery,
        },
        {
          arrayFilters: [{ 'elem.identity': identity }],
        }
      );
  
      return edited;
  }
  

  async deleteFromWorkoutInWorkouts(workout_id, identity) {
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


  }


}

module.exports = new WorkoutService();
