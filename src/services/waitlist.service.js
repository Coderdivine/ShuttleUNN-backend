const WaitList = require("../models/waitlist.model");
const CustomError = require("../utils/custom-error");
const uuid = require("uuid");
const nameTheUsername = require("unique-username-generator");
const { sendWaitListMessage } = require("../utils/sendWaitListMessage");

class WaitListService {

  async joinWaitList({ email }) {
    try {
        console.log({ email });
      const waitlist = await WaitList.findOne({ email });
      if (waitlist)
      throw new CustomError("You're already on our waitlist.", 400);
      const username = nameTheUsername.generateUsername();
      console.log({ username });
      const addMember = new WaitList({
        email,
        tag:username,
        waitlist_id:uuid.v4(),
      });
      const savedMember = await addMember.save();
      return savedMember;
    } catch (error) {
        console.log({ error })
      throw new CustomError("An error occured. Please ty again later.", 500);
    }
  }

  async sendMessage({ email, message }) {
    try {
      console.log({ email, message })
      const wailListmember = await WaitList.findOne({ email });
      if (!wailListmember) { throw new CustomError("Please join our waitlist first.") };
      const messageConfig = await sendWaitListMessage(email, message);
      if (!messageConfig)
        throw new CustomError("Unable to send message. please try again.", 400);
      console.log({ messageConfig });
      return {
        message: "Message sent.",
      };
    } 
    catch (error) {
      console.log({ error });
      throw new CustomError("An error occured. Please ty again later.", 500);
    }
  }
}

module.exports = new WaitListService();
