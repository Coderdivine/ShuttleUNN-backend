const response = require("../utils/response");
const WorkoutService = require("../services/workout.service");
const CustomError = require("../utils/custom-error");

class WorkoutController {

    async getWorkouts(req, res){
        try{
            const result = await WorkoutService.getWorkouts();
            if(!result) throw new CustomError("Unable to get workouts",400);
            res.status(201).send(response("All workouts",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async getWorkout(req, res){
        try{
            const result = await WorkoutService.getWorkout(req.params.workout_id);
            if(!result) throw new CustomError("Unable to get workout",400);
            res.status(201).send(response("Workout",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async addWorkout(req, res){
        try{
            const result = await WorkoutService.addWorkout(req.body);
            if(!result) throw new CustomError("Unable to add workout",400);
            res.status(201).send(response("Workout added",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async register(req, res){
        try{
            const result = await WorkoutService.getWorkouts();
            if(!result) throw new CustomError("Unable to get workouts",400);
            res.status(201).send(response("All workouts",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

}

module.exports = new WorkoutController();
