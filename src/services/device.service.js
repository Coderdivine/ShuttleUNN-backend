const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Device = require("../models/device.model");
const CustomError = require("../utils/custom-error");

class DeviceService {
  async getDeviceDetails({ devsensor_id }) {
    const device = await Device.findOne({ devsensor_id });
    if (!device) throw new CustomError("Device not activated yet.", 400);
    return device;
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
    return { message: "Device Enabled" };
  }

  async disconnectWifi({ devsensor_id }) {
    const user = await User.findOne({ devsensor_id });
    if (!user) throw new CustomError("User device disabled.", 400);
    return { message: "Disconnect Wifi not available." };
  }
}

module.exports = new DeviceService();
