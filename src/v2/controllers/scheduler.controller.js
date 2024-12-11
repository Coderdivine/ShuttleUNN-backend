const response = require("../utils/response");
const CustomError = require("../utils/custom-error");
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
