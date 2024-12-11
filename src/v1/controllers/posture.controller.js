const response = require("../utils/response");
const PostureService = require("../services/posture.service");
const CustomError = require("../utils/custom-error");

class PostureController {
  async linkDevSensorId(req, res) {
    if (!req.body) throw new CustomError("Invalid request", 400);
    const result = await PostureService.linkDevSensorId(req.body);
    if (!result) throw new CustomError("No result was found.", 400);
    res.status(201).send(response("Dev Sensor device linked.", result));
  }

  async getAllPostures(req, res) {
    const result = await PostureService.getAllPostures();
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Posture fetched.", result));
  }

  async addPostures(req, res) {
    if (!req.body) throw new CustomError("No request found.", 400);
    const result = await PostureService.addPosture(req.body);
    if (!result) throw new CustomError("Oops! couldn't add posture", 400);
    res.status(201).send(response("Posture added.", result));
  }

  async getUserPostures(req, res) {
    if (!req.params) throw new CustomError("No request params passed.", 400);
    const result = await PostureService.getUserPostures(
      req.params.user_id,
      req.params.timeInterval
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("User posture fetched.", result));
  }

  async getPostureSummaryOfTheDay(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.getPostureSummaryOfTheDay(
      req.body.user_id
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Posture summary of the year.", result));
  }

  async getPostureSummaryOfTheWeek(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.getPostureSummaryOfTheWeek(
      req.body.user_id
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Posture summary of the year.", result));
  }

  async getPostureSummaryOfTheMonth(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.getPostureSummaryOfTheMonth(
      req.body.user_id
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Postutre Summary of the month.", result));
  }

  async getPostureSummaryOfTheYear(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.getPostureSummaryOfTheYear(
      req.body.user_id
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Posture summary of the year.", result));
  }

  async getPostureSummaryOfTheYear(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.getPostureSummaryOfTheYear(
      req.body.user_id
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Posture summary.", result));
  }

  async lastSixPosturesImage(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.lastSixPosturesImage(req.body.user_id);
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Last six postures fetched.", result));
  }

  async fiveCommonPostures(req, res) {
    if (!req.body) throw new CustomError("No request body passed.", 400);
    const result = await PostureService.fiveCommonPostures(
      req.body.user_id,
      req.body.period
    );
    if (!result) throw new CustomError("Oops! couldn't fetch postures", 500);
    res.status(201).send(response("Five common posture fetched.", result));
  }

  async groupPosturesByPeriod(req, res) {
    const result = await PostureService.groupPosturesByPeriod(
      req.body.user_id,
      req.body.period
    );
    if (!result)
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        400
      );
    res.status(201).send(response("Posture fetched.", result));
  }

  async predictWorkout(req, res) {
    const result = await PostureService.predictWorkout(
      req.body.user_id,
      req.body.period
    );
    if (!result)
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        400
      );
    res.status(201).send(response("Predicted workout.", result));
  }

  async postureSummary(req, res) {
    const result = await PostureService.postureSummary(req.body.user_id);
    if (!result)
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        400
      );
    res.status(201).send(response("Last posture summary", result));
  }
}

module.exports = new PostureController();
