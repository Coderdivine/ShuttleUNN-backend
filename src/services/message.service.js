const User = require("../models/user.model");
const Message = require("../models/message.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const moment = require("moment");
const uuid = require("uuid");
const ExceriseModel = require("../models/excerise.model");
const { URL } = require("../config");
const Posture = require("../models/posture.model");
const { useMessageAI } = require("../utils/ai");




class MessageService {

    async sendMessage({ message, user_id }) {
        const user = await User.findOne({ user_id });
        if(!user) throw new CustomError("User not found", 400);
        const message_id = uuid.v4();
        const newMessage = new Message({
            message_id,
            user_id,
            message,
            responder: "user"
        });

        const linked_message_id = message_id;
        const reply = await this.reply(user_id, message);
        const newMessageReply = new Message({
            message_id,
            user_id,
            linked_message_id,
            responder: "ai",
            message: reply
        });

        const messageSent = await newMessage.save();
        const messageReply = await newMessageReply.save();
        return {
            message_id,
            messageReply,
            messageSent
        }
    }

    async reply(user_id, message) {

        const recentPosture = await this.recentPosture(user_id);
        const recentWorkoutGiven = await this.recentWorkoutGiven(user_id);
        const { message: reply } = await useMessageAI.generateMessage({ message, recentPosture, recentWorkoutGiven });
        return reply;
    }

    async getMessages( user_id ) {
        const messages = await Message.find({ user_id }).limit(50);
        return messages;
    }

    async recentPosture(user_id) {
        const postures = await Posture.find({ user_id }).limit(18).sort({ date: -1 })
        return "User had" + await postures.map(
            (p) =>
              `-> body posture: ${p?.posture_name} on ${p.date}. ;`
          )
          .join("");
    }

    async recentWorkoutGiven(user_id) {
        const workouts = await ExceriseModel.find({ user_id }).limit(8).sort({ date: -1 })
        return "User was given to following workout to do,(Not all workout was done):" + await workouts.map(
            (p) =>
              `title: ${p?.title}, description: ${p?.description} on ${p.date}. ;`
          )
          .join("");
    }
}

module.exports = new MessageService();