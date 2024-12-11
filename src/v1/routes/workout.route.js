const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const sharp = require("sharp");
const WorkoutCtrl = require("../controllers/workout.controller");


router.post("/workout", WorkoutCtrl.addWorkout);
router.get("/workouts", WorkoutCtrl.getWorkouts);
router.get("/workout/:workout_id", WorkoutCtrl.getWorkout);
router.post("/delete", WorkoutCtrl.deleteWorkout);
router.post("/update", WorkoutCtrl.updateWorkout);
router.post("/save", WorkoutCtrl.saveWorkout);
router.post("/add-new-workout-to-workouts", WorkoutCtrl.addNewWorkoutInWorkouts);
router.post("/edit-workout-in-workouts", WorkoutCtrl.editWorkoutInWorkouts);
router.post("/delete-workout-in-workouts", WorkoutCtrl.deleteFromWorkoutInWorkouts);



module.exports = router;