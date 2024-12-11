const moment = require("moment");
const CustomError = require("./custom-error");
const PushNotification = require("./firebase");
const User = require("../models/user.model");
const { weeklyReport } = require("./ai/posture.ai");
const { URL } = require("../config");

class WeeklyReport {

  constructor(PostureModel) {
    this.PostureModel = PostureModel;
  }

  getCurrentWeekDates() {
    const startOfWeek = moment().startOf("week");
    const endOfWeek = startOfWeek.clone().endOf("week");

    console.log({
      getCurrentWeekDates: {
        startOfWeek,
        endOfWeek,
      },
    });
    return {
      startOfWeek,
      endOfWeek,
    };
  }

  async sendWeeklyImprovements(user_id) {
    const { startOfWeek, endOfWeek } = this.getCurrentWeekDates();
    if (((await this.WeeklyReportEnabled(user_id)) && this.isMonday()) && !(await this.isMessageSentForCurrentWeek(user_id)) ){
    const currentWeekPostures = await this.PostureModel.find({
      user_id,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).limit(20);

    const { start: previousStart, end: previousEnd } =
      this.getPreviousWeekDates(startOfWeek, endOfWeek);

    const previousWeekPostures = await this.PostureModel.find({
      user_id,
      date: { $gte: previousStart, $lte: previousEnd },
    }).limit(20);

    const improvementData = {
      currentWeekPostures,
      previousWeekPostures,
    };

    console.log("Weekly Improvement:", improvementData);
    const { title, description } = await this.useAi(improvementData);
    console.log({ title, description })
    const sendMessage = await this.sendNotifications({
      user_id,
      title,
      description,
      link: null,
    });
    await this.markMessageAsSentForCurrentWeek(user_id);
    console.log({ sendMessage });

    return { title, description };
    } else {
      return { message: "Weekly update sent already or it's not monday" }; 
    } 
  }

  getPreviousWeekDates(currentStartOfWeek, currentEndOfWeek) {
    const startOfWeek = currentStartOfWeek.clone().subtract(1, "week");
    const endOfWeek = currentEndOfWeek.clone().subtract(1, "week");

    console.log({
      getPreviousWeekDates: {
        start: startOfWeek,
        end: endOfWeek,
      },
    });
    return {
      start: startOfWeek,
      end: endOfWeek,
    };
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

        const sendNotificationPromise = await PushNotification.sendMessage(
          message
        );
        sendNotificationPromises.push(sendNotificationPromise);
      }
    }

    const responses = await Promise.all(sendNotificationPromises);

    return responses;
  }

  async useAi({ currentWeekPostures , previousWeekPostures }) {
    const current = await currentWeekPostures.map(
        (p) =>
          `-> had body posture: ${p.posture_name} on ${p.date}. ;`
      )
      .join("");
    const previous = await previousWeekPostures.map(
        (p) =>
          `-> had body posture: ${p.posture_name}  on ${p.date}. ;`
      )
      .join("");
      console.log({ current, previous });
      const { title, description } = await weeklyReport({ current, previous });
      return { title, description };
  }

  isMonday() {
    const today = moment();
    return today.day() === 1;
  }

  async isMessageSentForCurrentWeek(user_id) {

    const user = await this.PostureModel.findOne({ user_id });

    if (!user || !user.lastMessageSentDate) {
      return false;
    }

    const lastMessageSentDate = moment(user.lastMessageSentDate);
    const startOfCurrentWeek = this.getCurrentWeekDates().startOfWeek;

    return lastMessageSentDate.isSameOrAfter(startOfCurrentWeek);
  }

  async markMessageAsSentForCurrentWeek(user_id) {
   await this.PostureModel.updateOne({ user_id }, { $set: { lastMessageSentDate: moment().toISOString() } });
  }

  async WeeklyReportEnabled(user_id) {
    const user = await User.findOne({ user_id });
    if(!user) throw new CustomError("User nor found", 400);
    return user?.enableWeeklyReport || false;
  }
}

module.exports = WeeklyReport;
