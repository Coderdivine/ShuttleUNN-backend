const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const Notifications = require("../models/notification.model");
const Affected = require("../models/affected.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const moment = require("moment");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const Excerise = require("./excerise.service"); // createWorkouts.func(). getWorkouts.func();
const ExceriseModel = require("../models/excerise.model");
const PushNotification = require("../utils/firebase");
const { URL } = require("../config");
const Posture = require("../models/posture.model");
const { CombineAI, WorkoutAI, PostureAI } = require("../utils/ai");
const WeeklyReport = require("../utils/weeklyImprovement");
const Pose = require("../utils/Pose");

class Track {

  async trackPosture(user_id, data) {
    const posture_id = uuid.v4();
    const {
      devsensor_id,
      posture_name,
      posture_accuracy,
      posture_json,
      format,
      camera_resolution,
      deviceX,
      deviceY,
      posture_rate,
      normalizedX,
      normalizedY,
      height,
      width,
      trackInterval,
      deviceType,
    } = data;
    let useJSON = posture_json;
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not located.", 400);
    if(format == "csv"){
      useJSON = this.changeCSVtoJSON(useJSON);
    }

    const newPosture = await new Posture({
      posture_id,
      user_id,
      devsensor_id,
      posture_name:
        posture_name ||
        (
          await this.createPostureName(useJSON, width, height)
        ).posture_name,
      posture_accuracy,
      posture_rate,
      camera_resolution,
      deviceX,
      posture_json: JSON.stringify(useJSON),
      format,
      deviceY,
      normalizedX,
      normalizedY,
      height,
      width,
      trackInterval,
      deviceType,
    }).save();

    const weeklyResponse = await this.sendWeeklyReport(user_id);
    const isTime = await this.isTimeToPushNotification(user_id);
    return {
      isTime,
      newPosture,
      weeklyResponse,
    };
  }

  changeCSVtoJSON(posture_json) {
     if(typeof posture_json !== "string") throw new CustomError("Invalid CSV parsed.", 400);
     const objects = posture_json.split(";");
     // firmware usecase: void trackPostureCSV(String stringCSV)
     const jsonOuput = objects?.map(obj =>{
        const params = obj.split(",");
        const label = params[0] || "";
        const value = Number(params[1]) || 0;
        const x = Number(params[2]) || 0;
        const y = Number(params[3]) || 0;
        const height = Number(params[4]) || 0;
        const width = Number(params[5]) || 0;
        return { label, value, x, y, height, width };
     });
     return jsonOuput;
  }

  async createPostureName(json, width, height) {
    const checkAndParseJSON = (json) => {
      if (typeof json === 'string') {
          try {
              return JSON.parse(json);
          } catch (error) {
              throw new CustomError("error", 400);
          }
      } else {
          return json;
      }
    }
    
    const validatedJson = checkAndParseJSON(json);
    const postureName = new Pose({});
    const {
      posture_name,
      new_json
    } = await postureName.finalPosture(validatedJson, Number(width), Number(height)) || "Sitting poorly";

    return {
      posture_name,
      new_json
    } ;
  }

  async trackPostureArray(user_id, data) {
    const posture_id = uuid.v4();
    const {
      devsensor_id,
      posture_array,
      isArray,
      camera_resolution,
      trackInterval,
      deviceType,
    } = data;

    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not located.", 400);

    const newPosture = await new Posture({
      posture_id,
      user_id,
      isArray,
      devsensor_id,
      posture_array,
      camera_resolution,
      trackInterval,
      deviceType,
    }).save();

    const isTime = await this.isTimeToPushNotification(user_id);
    return {
      isTime,
      newPosture,
    };
  }

  async recentPosture(user_id) {
    const user = await User.findOne({ user_id });
    const intervalAvg = this.calculateAverage([
      user?.workoutAlert,
      user.alertInterval,
    ]);
    const limit = Math.round(intervalAvg / user?.track_frequency);
    // console.log({ intervalAvg, limit });

    const posture = await Posture.find({ user_id })
      .sort({ date: -1 })
      .limit(limit);
    return posture;
  }

  async preciseCalculation(user_id) {
    const validPostures = await this.recentPosture(user_id);

    const averagePerPosture = {};
    const countPerPosture = {};

    await Promise.all(
      validPostures.map(async (posture) => {
        const { posture_name, normalizedX } = posture;

        if (!averagePerPosture[posture_name]) {
          averagePerPosture[posture_name] = 0;
          countPerPosture[posture_name] = 0;
        }

        averagePerPosture[posture_name] += normalizedX;
        countPerPosture[posture_name] = countPerPosture[posture_name] + 1;
      })
    );

    // console.log({ countPerPosture, averagePerPosture });
    const result = await validPostures
      .map((posture) => {
        const { posture_name, normalizedX } = posture;
        if (posture_name == "no human detected") {
          const average = validPostures.length / countPerPosture[posture_name];

          // Check if normalizedX value is >= average for the posture name
          const isAboveAverage = countPerPosture[posture_name] >= average;

          // Convert Mongoose document to plain JavaScript object
          const plainObject = posture.toObject();

          return { ...plainObject, isAboveAverage };
        } else {
          const average =
            averagePerPosture[posture_name] / countPerPosture[posture_name];

          // Check if normalizedX value is >= average for the posture name
          const isAboveAverage = normalizedX >= average;

          // Convert Mongoose document to plain JavaScript object
          const plainObject = posture.toObject();
          return { ...plainObject, isAboveAverage };
        }
      })
      .filter((posture) => posture.isAboveAverage == true);

    return result;
  }

  async getAllUserPostures(user_id) {
    const posture = await Posture.find({ user_id }).sort({ date: -1 });
    return posture;
  }

  async getRecentPostures(user_id) {
    const posture = await Posture.find({ user_id }).limit(5).sort({ date: -1 });
    return posture;
  }

  async sendNotifications(data) {
    const { user_id, title, description, link } = data;
    const user = await User.findOne({ user_id });

    if (!user) {
      throw new CustomError("User not located..", 400);
    }

    const devices = user?.fcm_token;
    const sendNotificationPromises = [];

    for (let i = 0; i < devices?.length; i++) {
      const registrationToken = devices[i]?.token;
      if (registrationToken.length > 10) {
        const message = {
          token: registrationToken,
          notification: {
            title,
            body: description,
          },
          data: {
            title,
            body: description,
            icon: "https://pbs.twimg.com/profile_images/1710830966212620288/5UPzHw2W_400x400.jpg",
            link_url: link || URL?.DASHBOARD_URL,
          },
        };

        const sendNotificationPromise = await PushNotification.sendMessage({ message: message, user });
        sendNotificationPromises.push(sendNotificationPromise);
      }
    }

    const responses = await Promise.all(sendNotificationPromises);

    return responses;
  }

  async lastNotificationSent({user_id, timestamps }) {
    const notifications = await Notifications.find({ user_id }).sort({
      date: -1,
    });

    const getLastNotificationOfType = (type) => {
      const notificationOfType = notifications.find((n) => n?.type === type);
      const result = notificationOfType ? notificationOfType.date : timestamps|| Date.now();
      return result;
    };

    const workout = getLastNotificationOfType("workout");
    const warning = getLastNotificationOfType("warning");
    const alert = getLastNotificationOfType("alert");
    const combined = getLastNotificationOfType("combined");

    return { workout, warning, alert, combined };
  }

  async lastAvgSittingTime(devsensor_id) {
    const posture = await Posture.findOne({
      devsensor_id,
      posture_name: "no human detected",
    })
      .sort({ date: -1 })
      .exec();
    console.log({ posture });
    if (!posture) {
      return {
        lastSittingTime: Date.now() / 1000,
        period: 1,
      };
    } else {
      const dateObject = new Date(posture?.date);
      console.log({ lastTime: moment(dateObject).format() });
      const dateNowFormat = dateObject.getTime();
      const lastSittingTime = dateNowFormat;
      const periodInSeconds = lastSittingTime
        ? (Date.now() - lastSittingTime) / 1000
        : null;

      return {
        lastSittingTime,
        period: periodInSeconds,
      };
    }
  }

  async intervalToSendalert(user) {
    const interval = user?.alertInterval;
    return interval;
  }

  async intervalToSendWorkout(user) {
    const interval = user?.workoutAlert;
    return interval;
  }

  getRandomNumberToAvg(avg) {
    const threshold = 0.13;
    return avg > 0 && Number.isInteger(avg)
      ? Math.floor(Math.random() * (avg / threshold)) + avg / threshold 
      : null;
  }

  async isTimeToPushNotification(user_id) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not located..", 400);
    const { workout, warning, alert, combined } =
      await this.lastNotificationSent({ user_id, timestamps: user?.timestamps }); // Dates
    const intervalToSendalert = await this.intervalToSendalert(user); // Sec
    const intervalToSendWorkout = await this.intervalToSendWorkout(user); // Sec
    const { lastSittingTime, period } = await this.lastAvgSittingTime(
      user?.devsensor_id
    ); // Date && secs
    const { timeUnit, values, Countdowns } =
      await this.createNotificationExpression({
        initalCountdowns: [
          intervalToSendWorkout,
          intervalToSendalert,
          intervalToSendalert,
          intervalToSendalert,
        ],
        dynamicCountdowns: [
          moment(workout).toDate(),
          moment(warning).toDate(),
          moment(alert).toDate(),
          moment(combined).toDate(),
        ],
        lastSittingTime,
        period,
        user_id
       });

    const sendNotification = await this.sendNotification(
      user_id,
      values,
      timeUnit,
      Countdowns
    );
    return sendNotification;
  }

  async createNotificationExpression(data) {
    console.log("Creating message *:::>");
    const {
      initalCountdowns,
      user_id,
      dynamicCountdowns,
      lastSittingTime,
      period,
    } = data;

    // Check if the period in seconds is greater than 24hrs in seconds
    // useTimer if new user? " Check Date.now() > accountCreated : Perform countdowns " ...

    const useTimer = false // period < 24 * 60 * 60;

    // const Countdowns = if initalCountdowns? create a function to map the values(Numbers) in descending order: else create a function to map the values(date) in descending order
    const initalCountdownsAvg = this.calculateAverage(initalCountdowns);
    const newInitalCountdowns = initalCountdowns.map(
      (x) => Math.floor(x) // + this.getRandomNumberToAvg(initalCountdownsAvg)
    );

    const newdynamicCountdowns = dynamicCountdowns.map((timestamp, index) => {
      const randomMilliseconds =
        this.getRandomNumberToAvg(newInitalCountdowns[index]) * 1000;
      console.log({ timestamp: moment(timestamp).format("YYYY-MM-DD hh:mm:ss.SSS A") });
      return new Date(timestamp).getTime() // + randomMilliseconds;
    });

    console.log({
      newdynamicCountdowns: newdynamicCountdowns.map((x) =>
        moment(x).format("YYYY-MM-DD hh:mm:ss.SSS A")
      ),
      newInitalCountdowns
    });

    const Countdowns = useTimer ? newInitalCountdowns : newdynamicCountdowns;

    const timeUnit = useTimer ? "sec" : "millseconds";

    console.log({ timeUnit, Countdowns });

    // calculate the avg of Countdowns
    const avg = useTimer
      ? this.calculateAverage(Countdowns)
      : this.calculateAverageDate(Countdowns);
    const lastSittingTimenewDate = new Date(lastSittingTime).getTime();
    const currentDate = Date.now();
    const duration = this.calculateAverage(newInitalCountdowns);

    console.log({
      currentDate: moment(currentDate).format("YYYY-MM-DD hh:mm:ss.SSS A"),
      CountDownAvg: useTimer ? avg : moment(avg).format("YYYY-MM-DD hh:mm:ss.SSS A"),
      lastSittingTimenewDate: moment(lastSittingTimenewDate).format("YYYY-MM-DD hh:mm:ss.SSS A"),
      duration
    });

    const currentDateMoment = moment(currentDate);
    const CountDownAvgMoment = useTimer ? moment(avg) : moment(avg);
    const lastSittingTimenewDateMoment = moment(lastSittingTimenewDate);
    const diffInSeconds = currentDateMoment.diff(CountDownAvgMoment, 'seconds');

    console.log({
      currentDateMoment,
      CountDownAvgMoment,
      lastSittingTimenewDateMoment,
      diffInSeconds
    })


    if (diffInSeconds > duration) {
        console.log("The time between currentDate and CountDownAvg is greater than the specified duration.");
    } else {
        console.log("The time between currentDate and CountDownAvg is not greater than the specified duration.");
    }

    // if useTimer is true and ((lastSittingTime from date to sec) < avg ) else (Date.now() < avg) = true;
    const firstCondition = Math.round(
      Date.now() / 1000 - lastSittingTimenewDate / 1000
    );






    const isTimeToPush = useTimer
      ? diffInSeconds > duration
      : diffInSeconds > duration;

    console.log("Checking time to push message :::>")
    console.log({ isTimeToPush });






    if (isTimeToPush) {
      // create a function called checkBoolean to check this
      const checkBoolean = useTimer
        ? await this.checkBooleanExpressions(Countdowns, initalCountdownsAvg)
        : await this.checkBooleanExpressionsForDate(
            Countdowns,
            initalCountdownsAvg
          );
      console.log({ checkBoolean });

      // pass the returned to: this.checkExpression() to return values
      const values = this.checkExpression(checkBoolean);
      console.log({ values });

      console.log("Creating message :::>");
      const sendPushMessage = await this.releaseMessage(user_id);
      console.log({ sendPushMessage });
      return { timeUnit, values, Countdowns };
    } else {
      console.log("Pushing message :::>");
      const sendPushMessage = await this.releaseMessage(user_id);
      console.log({ sendPushMessage });
      return false;
    }
  }

  createDescendingOrderNumbers(countdowns) {
    // Implementation to map the values(Numbers) in descending order
    console.log({ countdowns });
    return Object.values(countdowns).sort((a, b) => b - a);
  }

  createDescendingOrderDates(countdowns) {
    return Object.values(countdowns).sort((a, b) => {
      const dateA = new Date(a).getTime() || a; // Convert to milliseconds or use the original value
      const dateB = new Date(b).getTime() || b; // Convert to milliseconds or use the original value

      return dateB - dateA;
    });
  }

  calculateAverage(countdowns) {
    // Implementation to calculate the average of Countdowns
    return (
      countdowns.reduce((sum, value) => sum + value, 0) / countdowns.length
    );
  }

  calculateAverageDate(array) {
    const sum = array.reduce((acc, value) => {
      if (value instanceof Date) return acc + value.getTime();
      if (typeof value === "number") return acc + value;

      throw new Error("Unsupported data type");
    }, 0);

    return sum / array.length;
  }

  checkTime(condition) {
    // Implementation to check if it's time to push notification based on the condition
    return condition;
  }

  async checkBooleanExpressions(countdowns, initalCountdownsAvg) {
    const result = [
      true,
      [
        false, //countdowns[0] >= countdowns[1],
        countdowns[0] / (initalCountdownsAvg - 4) >= countdowns[1],
      ],
      [
        false, // countdowns[1] >= countdowns[2],
        countdowns[1] / (initalCountdownsAvg - 4) >= countdowns[2],
      ],
    ];

    return result;
  }

  async checkBooleanExpressionsForDate(countdowns, initalCountdownsAvg) {
    let useValue = moment(countdowns[0])
      .subtract(initalCountdownsAvg, "seconds")
      .toDate();
    useValue = new Date(useValue).getTime();
    console.log({
      useValue: moment(useValue).format("YYYY-MM-DD hh:mm:ss.SSS A"),
    });
    countdowns.map((x) =>
      console.log(moment(x).format("YYYY-MM-DD hh:mm:ss.SSS A"))
    );
    const result = [
      true,
      [
        false, //countdowns[0] >= countdowns[1],
        countdowns[0] - useValue >= countdowns[1],
      ],
      [
        false, //countdowns[1] >= countdowns[2],
        countdowns[1] - useValue >= countdowns[2],
      ],
    ];

    return result;
  }

  checkExpression(booleanValues) {
    // Ensure booleanValues is an array
    if (Array.isArray(booleanValues)) {
      // Implementation to check expressions based on boolean values and return countdown names
      const result = booleanValues.map((arr, index) => {
        // Check if arr is an array
        console.log({ arr });
        if (Array.isArray(arr) && arr.every(Boolean)) return 0;

        const countdownNames = [];
        if (!arr || !arr[0]) {
          countdownNames.push(index + 1);
        }

        return countdownNames;
      });

      return result.flat().filter((value) => value !== 0);
    } else {
      // Handle the case where booleanValues is not an array
      return [];
      // or any other default value or error handling approach
    }
  }

  async useProfile(user_id) {
    const user = await User.findOne({ user_id });
    const profile = user?.useProfileForWorkout;
    if (user && profile) {
      const returnedText = `
      Consider this information as a reference: the user's age is ${user?.age}, 
      identified as ${user?.gender}, engaged in ${user?.occupation}
      with a weight of ${user?.weight} and a height of ${user?.height}.
      hobby: ${user?.hobby}.
      `;
      return returnedText;
    } else {
      return "";
    }
  }

  async sendNotification(user_id, value, timeUnit, Countdowns) {
    const msgLength = value?.length;
    const multipltBy = timeUnit === "sec" ? 1000 : 1;
    const recentPosture = await this.preciseCalculation(user_id);
    const recentPostureIntext = await this.recentPostureIntext(recentPosture);
    const profile = await this.useProfile(user_id);

    if (!msgLength || msgLength > 3) return false;

    const notifications = [];
    const generateNotification = async (i) => {
      let generatedContent, notificationType;
      console.log({ i });
      if (i === 1) {
        generatedContent = await CombineAI.combineAlert({
          postures: recentPostureIntext,
          profile,
        });
        notificationType = "combined";
        console.log({ i, notificationType, generatedContent: {} });
      } else if (i === 2) {
        generatedContent = await WorkoutAI.generateWorkout({
          postures: recentPostureIntext,
          difficultyLevel: "",
          ...this.getLastWorkoutDetails(user_id),
          profile,
        });
        notificationType = "workout";
        const excerise_id = uuid.v4();
        const thereIsWorkout = URL.LANDING_URL + `/workout/${excerise_id}`;
        const {
          workout_name,
          workout_description,
          duration,
          workout_notification_text,
          instruction,
          difficultyLevel,
        } = generatedContent;
        console.log({
          i,
          notificationType,
          generatedContentworkout: generatedContent,
        });
        const newWorkout = new ExceriseModel({
          excerise_id,
          user_id,
          title: workout_name,
          description: workout_description,
          duration,
          notification_text: workout_notification_text,
          posture_csv: recentPostureIntext,
          instruction,
          difficultyLevel,
        });

        const saved = await newWorkout.save();
      } else if (i === 3) {
        generatedContent = await PostureAI.createAlert({
          postures: recentPostureIntext,
          profile,
        });
        notificationType = "warning";
        console.log({ i, notificationType, generatedContent });
      }

      if (!generatedContent && i !== 0)
        throw new CustomError("Unable to generate content.", 400);

      if (i !== 0) {
        const {
          summary,
          notification_description,
          notification_notification_text,
          importance,
          workout_name,
          workout_description,
          duration,
          areas,
          instruction,
          difficultyLevel,
          warning,
          warning_description,
          warning_notification_text,
          damageLevel,
          alert,
          alert_description,
          alert_notification_text,
          damageLevel: alertDamageLevel,
        } = generatedContent;

        const nextNotificationDate =
          timeUnit === "sec"
            ? Date.now() + Countdowns[i] * 1000
            : Countdowns[i];
        const saveAffected = await new Affected({
          afftected_id: uuid.v4(),
          area: areas,
          user_id,
          posture: recentPostureIntext || "No posture yet",
          percentage: 0,
        }).save();

        const newMessage = new Notifications({
          user_id,
          notification_id: uuid.v4(),
          title: summary || workout_name || warning || alert,
          notification_text:
            notification_notification_text ||
            workout_description ||
            warning_notification_text ||
            alert_notification_text,
          description:
            notification_description ||
            instruction ||
            warning_description ||
            alert_description,
          type: notificationType,
          sent: false,
          nextNotification: new Date(nextNotificationDate),
          date: new Date(Date.now()),
        });

        const saved = await newMessage.save();
        return saved;
      }
      return {};
    };

    const generatePromises = Array.from({ length: msgLength }, (_, i) =>
      generateNotification(i + 1)
    );

    const generatedNotifications = await Promise.all(generatePromises);

    notifications.push(...generatedNotifications);

    return notifications;
  }

  async recentPostureIntext(posture) {
    return posture?.map(
        (p) =>
          `-> had body posture: ${p.posture_name}  on ${p.date}. ;`
      )
      .join("") || "No posture yet";
      //at ${p.posture_accuracy}% accuracy
  }

  async recentWorkoutInText(workout) {
    return workout
      .map(
        (p) =>
          `-> had previously done the following workout: ${p.title}, description =>  ${p.description}, on ${p.date}. ;`
      )
      .join("") || "";
  }

  async getLastWorkoutDetails(user_id) {
    const lastWorkout = await ExceriseModel.findOne({ user_id }).sort({
      date: -1,
    });
    const workout = await ExceriseModel.find({ user_id }).sort({ date: -1 });
    const lastWorkoutInText = await this.recentWorkoutInText(workout);
    // console.log({ workout, lastWorkoutInText });
    return {
      lastWorkoutDate: lastWorkout?.date || new Date(Date.now()),
      lastWorkoutSent: lastWorkoutInText,
    };
  }

  async releaseMessage(user_id) {
    const currentDateTime = new Date();
    const messageToSend = await Notifications.find({
      user_id,
      sent: false,
      $and: [
        {
          date: {
            $gte: moment(currentDateTime).subtract(12, "hours").toDate(),
          },
        },
      ],
    })
      .sort({ date: -1 })
      .limit(2) || null;
    console.log({ messageToSend });

    let messageCount = 0;
    const sendNotificationsPromises = [];

    if(messageToSend){
      for (const message of messageToSend || []) {
        const pushMessagePromise = await this.sendNotifications({
          user_id,
          title: message.title,
          description: message.description,
          link: message.link,
        });
  
        const messageNotification = await Notifications.findOne({
          notification_id: message.notification_id,
        });
        messageNotification.sent = true;
        const saved = await messageNotification.save();
        const saveAllAsSent = await Notifications.updateMany(
          { user_id },
          { $set: { sent: true } }
        );
        sendNotificationsPromises.push(pushMessagePromise);
        messageCount++;
      }
  
      const pushMessages = await Promise.all(sendNotificationsPromises);
  
      pushMessages.forEach((pushMessage) => {
        messageCount++;
      });
    }

    console.log({ messageCount, reason: "releaseMessage" });

    return { messageCount, reason: "releaseMessage" };
  }

  async lastBodyPartAffected(user_id) {
    const user = await User.findOne({ user_id });
    const intervalAvg = this.calculateAverage([
      user?.workoutAlert,
      user.alertInterval,
    ]);

    const limit = Math.round(intervalAvg / user?.track_frequency);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const affected = await Affected.find({ 
      user_id,
      date: { $gte: oneWeekAgo }
    })
      .sort({ date: -1 })
      .limit(limit);
    // console.log({ affected: await affected.map((x) => x.area) });
    return affected;
  };
  

  async sendWeeklyReport(user_id) {
    const weekly_report = new WeeklyReport(Posture);
    const response = await weekly_report.sendWeeklyImprovements(user_id);
    if (!response) throw new CustomError("Unable to send weekly update", 400);
    return response;
  }
}

module.exports = new Track();
