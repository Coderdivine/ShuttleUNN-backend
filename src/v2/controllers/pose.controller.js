const response = require("../utils/response");
const CustomError = require("../utils/custom-error");
const PoseService = require("../services/pose.service");

class PoseController {

  async savePoseEstimation(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const result = await PoseService.savePoseEstimation(req.body);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Pose Estimate saved", result));
  }
 
  async recentPoseEstimate(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await PoseService.recentPoseEstimate(req.params.devsensor_id);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Recent Pose Estimate", result));
  }

  async getAvgPoseAngle(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await PoseService.getAvgPoseAngle(req.params.devsensor_id);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Average Pose Estimate", result));
  }

  async getPoseScore(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await PoseService.getPoseScore(req.params.devsensor_id);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Pose Score", result));
  }

  async getAnalysis(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await PoseService.getAnalysis(req.params.devsensor_id);
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Pose Analysis", result));
  }

}

module.exports = new PoseController();
