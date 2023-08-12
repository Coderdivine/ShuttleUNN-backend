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

    async deleteWorkout(req, res){
        try{
            if(!req.body) throw new CustomError("Please request can not be completed",400);
            const result = await WorkoutService.deleteWorkout(req.body.workout_id);
            if(!result) throw new CustomError("Unable to get workouts",400);
            res.status(201).send(response("Workout delete",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async updateWorkout(req, res){
        try{
            if(!req.body) throw new CustomError("request can't be completed. Please login again",400);
            const result = await WorkoutService.updateWorkout(req.body.workout_id, req.body);
            if(!result) throw new CustomError("Unable to update workout",400);
            res.status(201).send(response("Workout updated.",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async saveWorkout(req, res){
        try{
            if(!req.body) throw new CustomError("Request can't be completed.",400);
            const result = await WorkoutService.saveWorkout(req.body.user_id, req.body);
            if(!result) throw new CustomError("Unable to save workout",400);
            res.status(201).send(response("Workout saved",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async addNewWorkoutInWorkouts(req, res){
        try{
            if(!req.body) throw new CustomError("Request can't be completed.",400);
            const result = await WorkoutService.addNewWorkoutInWorkouts(req.body.workout_id, req.body);
            if(!result) throw new CustomError("Unable to add workout",400);
            res.status(201).send(response("Workout added",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async editWorkoutInWorkouts(req, res){
        try{
            if(!req.body) throw new CustomError("Request can't be completed.",400);
            const result = await WorkoutService.editWorkoutInWorkouts(req.body.workout_id, req.body.identity, req.body.updatedValue, req.body.updatedField);
            if(!result) throw new CustomError("Unable to edit workout",400);
            res.status(201).send(response("Workout Edited",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

    async deleteFromWorkoutInWorkouts(req, res){
        try{
            if(!req.body) throw new CustomError("please send the right request",400);
            const result = await WorkoutService.deleteFromWorkoutInWorkouts(req.body.workout_id, req.body.identity);
            if(!result) throw new CustomError("Unable to delete workout",400);
            res.status(201).send(response("Workout deleted",result));
        }catch(error){
            throw new CustomError(error.message,500);
        }
    }

}

module.exports = new WorkoutController();
