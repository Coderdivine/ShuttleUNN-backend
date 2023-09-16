const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Device = require("../models/device.model");
const CustomError = require("../utils/custom-error");

class DeviceService {

  async getDeviceDetails({ devsensor_id }) {
    try {
        const device = await Device.findOne({ devsensor_id });
        if(!device) throw new CustomError("Device not activated yet.", 400);
        return device;
    } catch (error) {
        throw new CustomError("An error occured. Please ty again later.",500)
    }
  } 

  async updateDevice(devsensor_id, data) {
    try {
        const device = await Device.updateOne({ devsensor_id }, { $set: data });
        if (!device) throw new CustomError("Device does not exist", 404);
        return device;
    } catch (error) {
        throw new CustomError("An error occured. Please ty again later.",500)
    }
  }

  async getWifiStrength({ devsensor_id, wifi_strength }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not available.", 400);
            device.wifi_strength = wifi_strength;
            await device.save();
            return wifi_strength;
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getBatteryLevel({ devsensor_id, battery_level }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not activated.", 400);
            device.battery_level = battery_level;
            await device.save();
            return battery_level;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getBatteryHealth({ devsensor_id, battery_health }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not activated.", 400);
            device.battery_health = battery_health;
            await device.save();
            return battery_health;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDevicehealth({ devsensor_id, device_health }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not activated.", 400);
            device.device_health = device_health;
            await device.save();
            return device_health;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDeviceMemory({ devsensor_id, device_memory }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not activated.", 400);
            device.device_memory = device_memory;
            await device.save();
            return device_memory; 
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDeviceAge({ devsensor_id, device_age }) {
        try {
            const device = await Device.findOne({ devsensor_id });
            if(!device) throw new CustomError("Device not activated.", 400);
            device.device_age = device_age;
            await device.save();
            return device_age; 
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async checkFrequency(frequency){
        try {
            if(frequency > 1300){
                return {
                    bool:false,
                    message:"Frequency must be less than 20mins."
                }
            }else if(frequency < 29){
                return {
                    bool:false,
                    message:"Frequency must be more than 30mins."
                }
            }
            return {
                bool:true,
                message:"Frequency is okay"
            }
        } catch (error) {
            throw new CustomError("An error occured.Unable to track frequency. Please ty again later.",500)
        }
  }


  async trackFrequency({ devsensor_id, frequency }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("Device not activated.", 400);
            const checkFrequency = await this.checkFrequency(frequency);
            if(!checkFrequency.bool) throw new CustomError((checkFrequency).message, 400);
            user.track_frequency = frequency;
            await user.save();
            return frequency;
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async disableDevice({ devsensor_id }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("Device not activated.", 400);
            user.isLinked = false;
            await user.save();
            return { message: "Device disabled" }
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async enableDevice({ devsensor_id }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("Device not activated.", 400);
            user.isLinked = true;
            await user.save();
            return { message: "Device Enabled" }
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async disconnectWifi({ devsensor_id }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User device disabled.", 400);
            return { message: "Disconnect Wifi not available." }
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }
}

module.exports = new DeviceService();
