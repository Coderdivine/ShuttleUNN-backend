const User = require("../models/user.model");
const { SCHEDULE_SECRET } = require("../config");
const Scheduler = require("../models/scheduler.model");
const ScheduleChat = require("../models/schedule-chat.model");
const CustomError = require("../utils/custom-error");
const GeminiAI = require("../utils/ai/gemini.ai");
const uuid = require("uuid");
const moment = require("moment");
const crypto = require("crypto");
const openai = require("../utils/ai/open.ai");
const google = require("../utils/drive");
const { timeStamp } = require("console");
const messageService = require("./message.service");

class SchedulerService {

  getNextReminderTimestamp(dayOfWeek, time) {
    const now = moment();
    const selectedTime = moment(`${dayOfWeek} ${time}`, "dddd hh:mm A");
    let nextReminder = selectedTime;

    if (selectedTime.isBefore(now)) {
      nextReminder = selectedTime.add(1, "weeks");
    }

    return nextReminder.valueOf();
  }

  isTimeForConveration(dayOfWeek, time) {
    const now = moment();
    const selectedTime = moment(`${dayOfWeek} ${time}`, "dddd hh:mm A");
    let nextReminder = selectedTime;

  
    if (selectedTime.isBefore(now)) {
      nextReminder = selectedTime.add(1, "weeks");
    }
  
    const timeDifference = nextReminder.diff(now, "minutes");

    if (timeDifference <= 25) {
      return true;
    }
  
    return false;
  }

  generateAccessSignature(hashedPassword) {
    const secretKey = SCHEDULE_SECRET;
    const createdHash = crypto
    .createHmac("sha256", secretKey)
    .update(hashedPassword)
    .digest("hex");
    return createdHash;
  }

  async makeCheck(schedulerData) {
    const { access, devsensor_id } = schedulerData;
    if (!devsensor_id)
      throw new CustomError("Please provide a DevSensor ID", 400);
    const user = await User.findOne({ devsensor_id });
    if(!user) throw new CustomError("Authentication failed, renew acces from your dashboard", 400);
    const expectedAccess = this.generateAccessSignature(user?.password);
    if (access !== expectedAccess)
      throw new CustomError(
        "Access expired. Please visit DevSensor Dashboard again",
        400
      );
  }

  async addScheduler(schedulerData) {
    await this.makeCheck(schedulerData);
    const { day, time, devsensor_id } = schedulerData; 
    const nextTimestamp = this.getNextReminderTimestamp(day, time);
    const schedule_id = uuid.v4();
    const user = await User.findOne({ devsensor_id });
    const newScheduler = new Scheduler({ ...schedulerData, schedule_id, scheduledDate: nextTimestamp, user_id: user?.user_id });
    return await newScheduler.save();
  }

  async getSchedules(schedulerData) {
    await this.makeCheck(schedulerData);
    const { devsensor_id } = schedulerData; 
    const schedules = await Scheduler.find({ devsensor_id }).sort({ timestamp: -1 });
    return schedules;
  }

  async checkSchedules(devsensor_id) {
    const schedules = await Scheduler.find({ devsensor_id }).sort({ timestamp: -1 });
    const schedule_check = await Promise.all(
      schedules.map(async (schedule) => {
        const dateInText = schedule.dateInText;
        const [dayOfWeek, time] = dateInText?.split(", ");
        const isTime = this.isTimeForConveration(dayOfWeek, time);
  
        if (isTime) {
          const message = await GeminiAI.createConversationTxt(schedule);
          return {
            ...schedule.toObject(),
            dayOfWeek,
            time,
            isTime,
            message,
          };
        }
        return null;
      })
    );
    const validSchedules = schedule_check.filter((item) => item !== null);
  
    console.log({ validSchedules });
    return validSchedules[0] || {};
  }
  
  async updateScheduler(schedulerData) {
    await this.makeCheck(schedulerData);
    const { schedule_id, updateData } = schedulerData;
    return await Scheduler.findOneAndUpdate({ schedule_id }, updateData, {
      new: true
    });
  }

  async dlt(schedulerData){
    await this.makeCheck(schedulerData);
    const schedule_id = schedulerData?.schedule_id;
    const deleted = await Scheduler.deleteMany({ schedule_id });
    return deleted;
  }

  async sendChat(path, devsensor_id) {
    const chat_id = uuid.v4();
    const user = await User.findOne({ devsensor_id });
    const user_id = user?.user_id;;
    const user_message =  await openai.speechToText(path);
    const output = path;
    const  { message_id, messageReply } = await messageService.sendMessage({ message: user_message.text, user_id: user_id });

    console.log({ messageReply: messageReply.message, output });
    const aiSpeech = await openai.textToSpeech(messageReply.message, output);
    const newChat = new ScheduleChat({ chat_id, devsensor_id, message: user_message.text, reply: messageReply.message, filePath: path, message_id, isAudio: true })
    await newChat.save();
    return {
      user_message: user_message?.text,
      aiSpeech
    };
  }

  async recentChat(devsensor_id) {
    return await ScheduleChat.find({ devsensor_id }).sort({ timestamp: -1 });
  }

}

module.exports = new SchedulerService();