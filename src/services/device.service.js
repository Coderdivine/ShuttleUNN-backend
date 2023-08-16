const { BCRYPT_SALT } = require("../config");
const User = require("../models/user.model");
const Billing = require("../models/billing.model");
const VToken = require("../models/vtoken.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const { sendMail, resetPassword } = require("../utils/sendMail");

class DeviceService {

  async getWifiStrength({ devsensor_id, wifi_strength }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
            return wifi_strength;
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getBatteryLevel({ devsensor_id, battery_level }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
            return battery_level;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getBatteryHealth({ devsensor_id, battery_health }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
            return battery_health;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDevicehealth({ devsensor_id, device_health }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
            return device_health;  
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDeviceMemory({ devsensor_id, device_memory }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
            return device_memory; 
        } catch (error) {
            throw new CustomError("An error occured. Please ty again later.",500)
        }
  }

  async getDeviceAge({ devsensor_id, device_age }) {
        try {
            const user = await User.findOne({ devsensor_id });
            if(!user) throw new CustomError("User disabled.", 400);
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
            if(!user) throw new CustomError("User disabled.", 400);
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
            if(!user) throw new CustomError("User disabled.", 400);
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
            if(!user) throw new CustomError("User disabled.", 400);
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
