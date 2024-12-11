const response = require("../utils/response");
const MessageService = require("../services/message.service");
const CustomError = require("../utils/custom-error");

class MessageController {
  async sendMessage(req, res) {
    const result = await MessageService.sendMessage(req.body);
    if (!result) throw new CustomError("Unable to send message.", 400);
    res.status(201).send(response("Message and reply", result));
  }

  async getMessages(req, res) {
    const user_id = req.params.user_id;
    const result = await MessageService.getMessages(user_id);
    if (!result) throw new CustomError("Unable to get recent messages.", 400);
    res.status(201).send(response("Recent messages", result));
  }
  
}

module.exports = new MessageController();
