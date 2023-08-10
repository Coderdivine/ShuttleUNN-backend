const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Workout = require("../models/workout.model");
const Posture = require("../models/posture.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const { useAi } = require("../utils/ai");

class UserService {
  async getAllPostures() {
    try {
      const posture = await Posture.find({});
      return posture;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async getUserPostures(user_id, timeInterval) {
    try {
      console.log({ timeInterval });
      const posture = await Posture.find({ user_id });
      return posture;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async generatePrompt(postures) {
    const postureData = postures.map(
      (posture) => `("${posture.posture_name}", "${posture.posture_accuracy}")`
    );
    return postureData.join(",");
  }

  async getPostureSummaryOfTheDay(user_id) {
    try {
      const currentDate = new Date();
      const startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      const postures = await Posture.find({
        user_id,
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async getPostureSummaryOfTheWeek(user_id) {
    try {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfWeek, $lt: endOfWeek },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async getPostureSummaryOfTheMonth(user_id) {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async getPostureSummaryOfTheYear(user_id) {
    try {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear + 1, 0, 1);
      const postures = await Posture.find({
        user_id: user_id,
        date: { $gte: startOfYear, $lt: endOfYear },
      });

      const prompt =
        "Utilize this data to create a concise and easily understandable sentence summarizing the human sitting posture. here's the data: " +
        (await this.generatePrompt(postures));
      const { bool, message } = await useAi(prompt);
      if (!bool)
        throw new CustomError(
          "Can't create summary due to high API usage. Please try again later.",
          400
        );
      return message;
    } catch (error) {
      throw new CustomError(
        "An error occurred. Please attempt again later.",
        500
      );
    }
  }

  async lastSixPosturesImage(user_id) {
    const currentDate = new Date();
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const postures = await Posture.find(
      {
        user_id: user_id,
        date: { $gte: startOfDay, $lt: endOfDay },
      },
      {
        posture_name: 1,
        posture_accuracy: 1,
        _id: 0,
      }
    )
      .sort({ date: -1 })
      .limit(6);

    return postures;
  }

  async fiveCommonPostures(user_id, timePeriod) {
    let startDate, endDate;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (timePeriod === "day") {
      startDate = new Date(
        currentDate.getFullYear(),
        currentMonth,
        currentDate.getDate()
      );
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    } else if (timePeriod === "month") {
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
    } else if (timePeriod === "year") {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear + 1, 0, 1);
    } else {
      throw new Error("Invalid time period");
    }

    const postures = await Posture.aggregate([
      {
        $match: {
          user_id: user_id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$posture_name",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    return postures;
  }

  async predictWorkout() {
    //daily and weekly...
  }

  // async createSocialSharingLink() {}
  // async createPostureHistory() {}
}

module.exports = new UserService();
