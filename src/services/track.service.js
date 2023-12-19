const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const Notifications = require("../models/notification.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const Excerise = require("./excerise.service"); // createWorkouts.func(). getWorkouts.func();

class Track {
  async trackPosture(user_id, data) {}
  async recentPosture(user_id) {}
  async preciseCalculation(postures) {}
  async getAllUserPostures(user_id) {}
  async getRecentPostures(user_id) {}
  async createNotificationExpression(data) {}
  async sendNotifications(data) {}
  async lastNotificationSent() {}
  async lastAvgSittingTime() {}
  async intervalToSendalert() {}
  async intervalToSendWorkout() {}
  async isTimeToPushNotification() {}
}

module.exports = new Track();
