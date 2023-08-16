const response = require("../utils/response");
const DeviceService = require("../services/device.service");
const CustomError = require("../utils/custom-error");

class UserContoller {

    async getWifiStrength(req, res) {
        try {
            if(!req.params) throw new CustomError("No parameter passed.", 400);
            const result = await DeviceService.getWifiStrength({ devsensor_id: req.params.devsensor_id, wifi_strength: req.params.wifi_strength })
            res.status(200).send(response("Wifi strength detected",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async getBatteryLevel(req, res) {
        try {
            if(!req.params) throw new CustomError("No parameter passed.", 400);
            const result = await DeviceService.getBatteryLevel(req.params);
            res.status(201).send(response("Registration completed",result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }


    
}

module.exports = new UserContoller();
