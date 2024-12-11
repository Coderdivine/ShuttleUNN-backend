const User = require("../models/user.model");
const CustomError = require("../utils/custom-error");
const Pose = require("../models/pose.model");
const Range = require("../models/range.model");
const RangeScore = require("../models/range-score.model");
const moment = require("moment");
const gemini = require("../utils/ai/gemini.ai");

class PoseService {
  async savePoseEstimation(data) {
    if (!data.devsensor_id)
      throw new CustomError(
        "Please link your device with your DevSensor Id",
        404
      );
    const devsensor_id = data.devsensor_id;
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("DevSensor ID not found", 400);

    const now = new Date();
    const recentRange = await Range.findOne({ devsensor_id }).sort({
      timestamp: -1,
    });

    const lastRangeTime =
      recentRange && moment(now).diff(moment(recentRange?.timestamp), "hours");

    console.log({
      lastRangeTime,
      time: moment(recentRange?.timestamp).format("dddd hh:mm A"),
    });

    if (lastRangeTime < 1) {
      return { message: "Not up to an hour" };
    }

    const postRange = await this.calculatePoseRanges(devsensor_id);
    const lastestRange = await Range.findOne({ devsensor_id }).sort({
      timestamp: -1,
    });

    const chat = await gemini.useGemini({ postureAngles: lastestRange });
    const newScore = new RangeScore({
      ...chat?.values,
      devsensor_id,
      user_id: user?.user_id,
    });
    await newScore.save();
    return this.similarPose(data, data.devsensor_id, user.user_id);
  }

  async recentPoseEstimate(devsensor_id) {
    const recentPose = await Pose.find({ devsensor_id })
      .sort({ timestamp: -1 })
      .limit(50);
    return recentPose;
  }

  async similarPose(data, devsensor_id, user_id) {
    const arePosesSimilar = (pose1, pose2, threshold = 2) => {
      return pose1.keypoints.every((keypoint, index) => {
        const diff = Math.abs(keypoint.angle - pose2.keypoints[index].angle);
        return diff <= threshold;
      });
    };

    const lastPose = await Pose.findOne({ devsensor_id }).sort({
      timestamp: -1,
    });

    if (lastPose && arePosesSimilar(data, lastPose)) {
      return await Pose.findByIdAndUpdate(lastPose._id, {
        $push: { duplicateTimestamps: Date.now() },
        $set: { isDuplicate: true },
      });
    } else {
      const newPoseEstimate = new Pose({ ...data, user_id: user_id });
      return await newPoseEstimate.save();
    }
  }

  async getAvgPoseAngle(devsensor_id) {
    const dailyAverages = await Pose.aggregate([
      {
        $match: { devsensor_id: devsensor_id },
      },
      { $unwind: "$keypoints" },
      {
        $group: {
          _id: {
            day: { $dayOfYear: "$timestamp" },
            year: { $year: "$timestamp" },
            minute: { $minute: "$timestamp" },
          },
          avgKeypoints: {
            $avg: "$keypoints.angle",
          },
        },
      },
    ]);
    return dailyAverages;
  }

  async calculatePoseRanges(devsensor_id) {
    if (!devsensor_id) {
      throw new CustomError("Please provide a DevSensor ID", 400);
    }

    // const now = new Date();
    // const lastHourStart = new Date(now.getTime() - 60 * 60 * 1000);

    const now = moment();
    const lastHourStart = moment().subtract(1, "hour");
    console.log({
      now: now.toDate(),
      last: lastHourStart.toDate()
    })

    const poses = await Pose.aggregate([
      {
        $match: {
          devsensor_id: devsensor_id,
          timestamp: { $gte: lastHourStart.toDate(), $lte: now.toDate() },
          // timestamp: {
          //   $gte: lastHourStart.toISOString(),
          //   $lte: now.toISOString(),
          // },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            day: { $dayOfYear: "$timestamp" },
            year: { $year: "$timestamp" },
            devsensor_id: "$devsensor_id",
          },
          keypoints: { $push: "$keypoints" },
        },
      },
    ]);

    if (!poses.length) {
      return {
        message: "Device is tracking",
      };
    }

    const processedRanges = poses.map((poseGroup) => {
      const { keypoints, _id } = poseGroup;
      const { hour, day, year, devsensor_id } = _id;

      const groupedKeypoints = keypoints.flat().reduce((acc, kp) => {
        if (
          kp &&
          kp.label &&
          kp.x != null &&
          kp.y != null &&
          kp.angle != null
        ) {
          acc[kp.label] = acc[kp.label] || [];
          acc[kp.label].push(kp);
        }
        return acc;
      }, {});

      const ranges = Object.entries(groupedKeypoints).reduce(
        (acc, [label, keypointData]) => {
          const calculateRange = (values) => {
            if (!values.length) return null;
            const avgCompute =
              values.reduce((sum, v) => sum + v, 0) / values.length;
            const avg = Math.round(avgCompute ?? 0);
            const min = Math.round(Math.min(...values) ?? 0);
            const max = Math.round(Math.max(...values) ?? 0);

            return {
              middle: {
                from: max - min,
                to: avg,
                label,
              },
              left: {
                from: min,
                to: avg,
                label,
              },
              right: {
                from: avg,
                to: max,
                label,
              },
            };
          };

          const xValues = keypointData
            .map((kp) => kp.x)
            .filter((v) => v != null);
          const yValues = keypointData
            .map((kp) => kp.y)
            .filter((v) => v != null);
          const angleValues = keypointData
            .map((kp) => kp.angle)
            .filter((v) => v != null);

          const xRange = calculateRange(xValues);
          const yRange = calculateRange(yValues);
          const angleRange = calculateRange(angleValues);

          const mergeRanges = (existing, newRange) => {
            const found = existing.find(
              (item) =>
                item.label === newRange.label &&
                item.from === newRange.from &&
                item.to === newRange.to
            );
            if (!found) existing.push(newRange);
          };

          // if (xRange) {
          //     mergeRanges(acc.middle, xRange.middle);
          //     mergeRanges(acc.left, xRange.left);
          //     mergeRanges(acc.right, xRange.right);
          // }
          // if (yRange) {
          //     mergeRanges(acc.middle, yRange.middle);
          //     mergeRanges(acc.left, yRange.left);
          //     mergeRanges(acc.right, yRange.right);
          // }

          if (angleRange) {
            mergeRanges(acc.middle, angleRange.middle);
            mergeRanges(acc.left, angleRange.left);
            mergeRanges(acc.right, angleRange.right);
          }

          return acc;
        },
        { middle: [], left: [], right: [] }
      );

      return {
        devsensor_id,
        timestamp: Date.now(), // new Date(year, 0).setDate(day) + hour * 60 * 60 * 1000,
        ...ranges,
      };
    });

    const result = await Range.insertMany(processedRanges);
    return result;
  }

  async getPoseScore(devsensor_id) {
    const score = await RangeScore.findOne({ devsensor_id }).sort({
      timestamp: -1,
    });
    return score || 0;
  }
}

module.exports = new PoseService();
