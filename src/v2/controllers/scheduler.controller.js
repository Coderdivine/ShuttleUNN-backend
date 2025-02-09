const response = require("../utils/response");
const CustomError = require("../utils/custom-error");
const fs = require("fs");
const SchedulerService = require("../services/scheduler.service");

class SchedulerController {
  async add(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.addScheduler(req.body);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedule saved", result));
  }

  async edit(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.updateScheduler(req.body);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedule edited", result));
  }

  async get(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.getSchedules(req.body);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedules", result));
  }

  async checkSchedules(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.checkSchedules(
      req.params.devsensor_id
    );
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedules Checked", result));
  }

  async sendChat(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
    if (!req.file)
      throw new CustomError("Pass an audio to start conversation", 400);
    const { path: audioPath } = req.file;
    const result = await SchedulerService.sendChat(
      audioPath,
      req.params.devsensor_id
    );
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
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
    // res.status(200).send(response("Schedules Checked", result));
    } catch (error) {
      throw new CustomError(error?.message??"Something went try again later.", 500)
    }
  }

  async recentChat(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.recentChat(req.params.devsensor_id);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedule Chats", result));
  }

  async dlt(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const result = await SchedulerService.dlt(req.body);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Schedule deleted", result));
  }
}

module.exports = new SchedulerController();
