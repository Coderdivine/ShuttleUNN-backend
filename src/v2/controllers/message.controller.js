const response = require("../utils/response");
const MessageService = require("../services/message.service");
const CustomError = require("../utils/custom-error");
const fs = require("fs");
const path = require("path");

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

  async textToAudio(req, res) {
    const result = await MessageService.textToAudio({ path: null, ...req.body});
    if (!result) throw new CustomError("Unable to convert text to audio.", 400);
    if (!result)
      throw new CustomError("Unable to generate audio at this time", 400);
    if (!fs.existsSync(result.aiSpeech)) {
      throw new CustomError("AI speech file not found.", 500);
    }
    res.set({
      "Content-Type": "audio/wav",
      "Content-Disposition": `inline; filename="${result.aiSpeech}"`,
    });

    const readStream = fs.createReadStream(result.aiSpeech);
    readStream.on("error", (err) => {
      console.error("Error reading AI speech file:", err);
      res.status(500).send("Error reading AI speech file.");
    });

    readStream.pipe(res);
  }

  async speechToText(req, res) {
    if (!req.file) throw new CustomError("Pass an audio to start conversation", 400);
    const { path: audioPath } = req.file;
    const theData = { path: audioPath, ...req.body };
    const result = await MessageService.speechToText(theData);
    if (!result) throw new CustomError("Unable to convert audio to text.", 400);
    res.status(201).send(response("Audio to text", result));
  }
}

module.exports = new MessageController();
