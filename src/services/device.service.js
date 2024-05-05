const { BCRYPT_SALT, URL } = require("../config");
const User = require("../models/user.model");
const Device = require("../models/device.model");
const CustomError = require("../utils/custom-error");
const { response } = require("express");
const Posture = require("../models/posture.model");
const PushNotification = require("../utils/firebase");

class DeviceService {


  async getDeviceDetails({ devsensor_id }) {
    const device = await Device.findOne({ devsensor_id });
    const user = (await User.findOne({ devsensor_id })) || {
      track_frequency: "60",
    };

    if (!device) throw new CustomError("Device not activated yet.", 400);

    return {
      ...device._doc,
      track_frequency: Number(user.track_frequency || "60"),
    };
  }

  async updateDevice(devsensor_id, data) {
    const device = await Device.updateOne({ devsensor_id }, { $set: data });
    if (!device) throw new CustomError("Device does not exist", 404);
    return device;
  }

  async getWifiStrength({ devsensor_id, wifi_strength }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not available.", 400);
    device.wifi_strength = wifi_strength;
    await device.save();
    return wifi_strength;
  }

  async getBatteryLevel({ devsensor_id, battery_level }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated.", 400);
    device.battery_level = battery_level;
    await device.save();
    return battery_level;
  }

  async getBatteryHealth({ devsensor_id, battery_health }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated.", 400);
    device.battery_health = battery_health;
    await device.save();
    return battery_health;
  }

  async getDevicehealth({ devsensor_id, device_health }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated.", 400);
    device.device_health = device_health;
    await device.save();
    return device_health;
  }

  async getDeviceMemory({ devsensor_id, device_memory }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated.", 400);
    device.device_memory = device_memory;
    await device.save();
    return device_memory;
  }

  async getDeviceAge({ devsensor_id, device_age }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated.", 400);
    device.device_age = device_age;
    await device.save();
    return device_age;
  }

  async checkFrequency(frequency) {
    if (frequency > 1300) {
      return {
        bool: false,
        message: "Frequency must be less than 20mins.",
      };
    } else if (frequency < 29) {
      return {
        bool: false,
        message: "Frequency must be more than 30mins.",
      };
    }
    return {
      bool: true,
      message: "Frequency is okay",
    };
  }

  async trackFrequency({ devsensor_id, frequency }) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("Device not activated.", 400);
    const checkFrequency = await this.checkFrequency(frequency);
    if (!checkFrequency.bool)
      throw new CustomError(checkFrequency.message, 400);
    user.track_frequency = frequency;
    await user.save();
    return frequency;
  }

  async disableDevice({ devsensor_id }) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("Device not activated.", 400);
    user.isLinked = false;
    await user.save();
    return { message: "Device disabled" };
  }

  async enableDevice({ devsensor_id }) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("Device not activated.", 400);
    user.isLinked = true;
    await user.save();
    console.log({ message: "Device Enabled" })
    return { message: "Device Enabled" };
  }

  async disconnectWifi({ devsensor_id }) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("User device disabled.", 400);
    return { message: "Disconnect Wifi not available." };
  }

  async onStart(devsensor_id) {
    const user = await User.findOne({ devsensor_id });
    // const on_start = user?.onStart;
    // const currentTime = Date.now();
    // const lastSentTime = new Date(on_start).getTime();
    // const timeDifference = currentTime - lastSentTime;
    if(!user?.isLinked){
        await this.enableDevice({ devsensor_id });
    }
    if (!user) throw new CustomError("Can trace user to device_id", 400);
    const devices = user?.fcm_token;
    const sendNotificationPromises = [];
    for (let i = 0; i < devices?.length; i++) {
      const registrationToken = devices[i]?.token;
      if (registrationToken.length > 10) {
        const message = {
          token: registrationToken,
          notification: {
            title: "Tracking started",
            body: "Device is now tracking",
          },
          data: {
            title: "Tracking started",
            body: "Device is now tracking",
            icon: "https://pbs.twimg.com/profile_images/1710830966212620288/5UPzHw2W_400x400.jpg",
            link_url: URL?.DASHBOARD_URL,
          },
        };

        const sendNotificationPromise = await PushNotification.sendMessage(
          message
        );
        sendNotificationPromises.push(sendNotificationPromise);
      }
    }

    const responses = await Promise.all(sendNotificationPromises);
    return responses;
  }

  async isActive(devsensor_id) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("Can't trace device", 400);

    const postures = await Posture.find({ devsensor_id })
      .sort({ date: -1 })
      .limit(1);

    const currentTime = Date.now();
    const postureTime = new Date(postures[0].date).getTime();
    const timeDifference = currentTime - postureTime;

    console.log({
      not_formatted: postures[0].date,
      formatted: new Date(postureTime),
      timeDifference: timeDifference,
      check: 2700000
    });

    if (timeDifference < 2700000) {
      return { bool: true };
    } else {
      return { bool: false };
    }
}

}

module.exports = new DeviceService();
