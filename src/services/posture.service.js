const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const Posture = require("../models/posture.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const { useAi } = require("../utils/ai");
const Notification = require("../models/notification.model");

class PostureService {

  async linkDevSensorId({ user_id, devsensor_id }){
           const user = await User.findOne({ user_id });
           if(!user) throw new CustomError("User details not found", 400);
          if(user.devsensor_id !== devsensor_id) throw new CustomError("Please insert the right devSensor ID.", 400);
          user.isLinked = true;
          const saved = await user.save();
          return saved;

  }

  async addPosture({ user_id, devsensor_id, posture_name, posture_accuracy, posture_rate }){
        const user = await User.findOne({ user_id });
        if(!user.isLinked) {
          throw new CustomError("Please associate your devSensor ID to initiate tracking.", 400);
        }
        const newPosture = new Posture({
              posture_id:uuid.v4(),
              user_id,
              devsensor_id, 
              posture_name, 
              posture_accuracy, 
              posture_rate, 
        });
        const saved = await newPosture.save();
        return saved;
 
  }

  async getAllPostures() {
      const posture = await Posture.find({});
      return posture;
 
  }

  async getUserPostures(user_id, timeInterval) {
      console.log({ timeInterval });
      const posture = await Posture.find({ user_id });
      return posture;
 
  }

  async postureSummary(user_id) {
    const message = await Notification.findOne({ user_id }).sort({ date: -1 });
    return message;
  }

  async generatePrompt(postures) {
    const postureData = postures.map(
      (posture) => `("${posture.posture_name}", "${posture.posture_accuracy}")`
    );
    return postureData.join(",");
  }

  async getPostureSummaryOfTheDay(user_id) {
      const currentDate = new Date();
      const startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      const postures = await Posture.find({
        user_id,
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
 
  }

  async getPostureSummaryOfTheWeek(user_id) {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfWeek, $lt: endOfWeek },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
 
  }

  async getPostureSummaryOfTheMonth(user_id) {
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
 
  }

  async getPostureSummaryOfTheYear(user_id) {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear + 1, 0, 1);
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfYear, $lt: endOfYear },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
 
  }


  async lastSixPosturesImage(user_id) {
    const currentDate = new Date();
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const postures = await Posture.find(
      {
        user_id: user_id,
        // date: { $gte: startOfDay, $lt: endOfDay },
      },
      {
        posture_name: 1,
        posture_accuracy: 1,
        _id: 0,
      }
    )
      .sort({ date: -1 })
      .limit(6);

    return postures;
  }

  async fiveCommonPostures(user_id, timePeriod) { 
        let startDate, endDate;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
    
        if (timePeriod === "day") {
          startDate = new Date(
            currentDate.getFullYear(),
            currentMonth,
            currentDate.getDate()
          );
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
        } else if (timePeriod === "month") {
          startDate = new Date(currentYear, currentMonth, 1);
          endDate = new Date(currentYear, currentMonth + 1, 0);
        } else if (timePeriod === "year") {
          startDate = new Date(currentYear, 0, 1);
          endDate = new Date(currentYear + 1, 0, 1);
        } else {
          throw new Error("Invalid time period");
        }
    
        const postures = await Posture.aggregate([
          {
            $match: {
              user_id: user_id,
              date: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: "$posture_name",
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
          {
            $limit: 5,
          },
        ]);
    
        return postures;

  }

  
  async listWorkouts() {
        const workouts = await Workout.find({}, { title: 1, workout_id: 1, _id: 0 });
        return workouts;
  }

  async groupPosturesByPeriod(user_id, period) {
        const currentDate = new Date();
        let startDate, endDate;
      
        if (period === 'day') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
        } else if (period === 'week') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
        } else if (period === 'month') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        } else if (period === 'year') {
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        } else {
          throw new CustomError('Invalid period', 400);
        }
      
        const postures = await Posture.find(
          {
            user_id: user_id,
            date: { $gte: startDate, $lt: endDate }
          },
          {
            posture_name: 1,
            posture_accuracy: 1,
            _id: 0
          }
        );
      
        const badPostures = postures.filter(posture => posture.posture_accuracy >= 20 && posture.posture_accuracy <= 40);
        const goodPostures = postures.filter(posture => posture.posture_accuracy >= 50 && posture.posture_accuracy <= 99);
      
        return { badPostures, goodPostures };
 

  }
  
  async predictWorkout(user_id, period) {
        const { badPostures, goodPostures } = await this.groupPosturesByPeriod(user_id, period);
        const suggestedWorkouts = [];
        if (badPostures.length > 0) {
          suggestedWorkouts.push(...await this.suggestWorkouts('bad', badPostures));
        }
    
        if (goodPostures.length > 0) {
          suggestedWorkouts.push(...await this.suggestWorkouts('good', goodPostures));
        }      
        return suggestedWorkouts;
   
  }

  async suggestWorkouts(postureType, postures) {

        const workouts = await this.listWorkouts();
        const prompt = await this.generatePromptForPostures(postureType, postures);
        const { bool, message } = await useAi(prompt);
        if(!bool) throw new CustomError("Please try again later", 400);
        const suggestedWorkoutIds = message.split(',');
        console.log({ suggestedWorkoutIds });
        const uniqueWorkoutIds = [...new Set(suggestedWorkoutIds)];
        const response_array = await uniqueWorkoutIds.map(suggestedId => workouts.find(w => w.workout_id === this.useRegex(suggestedId))).filter(workout => workout);
        return response_array;
 
 }
  
  async generatePromptForPostures(postureType, postures) {
    const postureData = postures.map(posture => `(Workout id:"${posture.posture_id}," Workout name: "${posture.posture_name}", " Workout Accuracy: ${posture.posture_accuracy}")`);
    const workoutData = (await Workout.find({})).map(workout => `(Workout id:"${workout.workout_id}," Workout title: "${workout.title}", " Workout description: ${workout.description}")`);
    return `Suggest 4 ${postureType} posture workouts based on this postures: ${postureData.join(',')}, and return workout_ids as response from this workouts: ${workoutData.join(',')}. Separate workout_ids by commas (","), return the ids only without texts for example: 12345,12345,12345,12345`;
  }

  useRegex(str){
    const regexPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'$/;
    const match = regexPattern.exec(str);
    if (match) {
      const validFormatString = match[0];
      return validFormatString;
    }
    return str;
  }

}

module.exports = new PostureService();
