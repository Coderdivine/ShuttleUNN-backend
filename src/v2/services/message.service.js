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
const openAi = require("../utils/ai/open.ai");

class MessageService {
  async sendMessage({ message, user_id }) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 400);
    
    const message_id = uuid.v4();
    const linked_message_id = message_id;
    const { reply, createMessage } = await this.reply(user_id, message);

    const newMessage = new Message({
      message_id,
      user_id,
      message: message,
      prompt: createMessage,
      responder: "user",
    });

    const newMessageReply = new Message({
      message_id,
      user_id,
      linked_message_id,
      responder: "ai",
      message: reply,
    });

    const messageSent = await newMessage.save();
    const messageReply = await newMessageReply.save();
    return {
      message_id,
      messageReply,
      messageSent,
    };
  }

  async textToAudio({ path, user_id, message_id }) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 400);
    if(!message_id)  throw new CustomError("Pass a message ID", 400);
    const theMessage = await Message.findOne({ linked_message_id: message_id, responder: "ai" });
    const output = path;
    const aiSpeech = await openAi.textToSpeech(theMessage.message, output);
    theMessage.isAudio = true;
    theMessage.filePath = output;
    await theMessage.save();
    return {
      user_message: theMessage.message,
      aiSpeech,
    };
  }

  async speechToText({ path, user_id }) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 400);
    const message_id = uuid.v4();
    const user_message = await openAi.speechToText(path);
    const message = user_message.text;
    const linked_message_id = message_id;
    const { reply, createMessage } = await this.reply(user_id, message);


    const newMessage = new Message({
        message_id,
        user_id,
        message: message,
        prompt: createMessage,
        responder: "user",
        isAudio: true,
        filePath: path,
      });
  
      const newMessageReply = new Message({
        message_id,
        user_id,
        linked_message_id,
        responder: "ai",
        message: reply,
      });
  
      const messageSent = await newMessage.save();
      const messageReply = await newMessageReply.save();
      return {
        message_id,
        messageReply,
        messageSent,
        user_message: user_message.text,
      };
  }

  async reply(user_id, message) {
    const recentPosture = await this.recentPosture(user_id);
    const recentWorkoutGiven = await this.recentWorkoutGiven(user_id);
    const recentMessages = await this.getrecentMessages(user_id);
    const useProfile = await this.useProfile(user_id);
    const { message: reply, createMessage } =
      await useMessageAI.generateMessage({
        message,
        recentPosture,
        recentWorkoutGiven,
        recentMessages,
        useProfile,
      });
    return { reply, createMessage };
  }

  async useProfile(user_id) {
    const user = await User.findOne({ user_id });
    const profile = user?.useProfileForWorkout;
    if (user && profile) {
      const returnedText = `
      Always consider my information before recommending anything to me: my ageis ${user?.age}, 
      my sex is: ${user?.gender}, I'm a ${user?.occupation}, I weigh ${user?.weight} and a height of ${user?.height},
      I love ${user?.hobby} as my hobby and sport activity.
      `;
      console.log({ Profile: returnedText });
      return returnedText;
    } else {
      return "";
    }
  }

  async getMessages(user_id) {
    let messages = await Message.find({ user_id }).sort({ $natural: -1 }).limit(10);
    messages = messages?.reverse();
    return messages;
  }

  async getrecentMessages(user_id) {
    let messages = await Message.find({ user_id }).limit(12);
    messages = await messages?.map((msg) => {
      
      return {
        role: msg.responder == "user" ? "user" : "assistant",
        content: msg?.prompt || msg?.message,
      }
    })
    return messages || [];
  }

  async recentPosture(user_id) {
    const postures = await Posture.find({ user_id }).limit(10).sort({ date: -1 });
    return ( "User had" + (await postures.map((p) => `-> body posture: ${p?.posture_name} on ${p.date}.;`).join("")) || "" );
  }

  async recentWorkoutGiven(user_id) {
    const workouts = await ExceriseModel.find({ user_id }).limit(7).sort({ date: -1 });
    return ( "" + (await workouts.map((p) => `title: ${p?.title}, description: ${p?.description} on ${p.date}. ;`).join("")) || "No Workout given yet");
  }

}

module.exports = new MessageService();
