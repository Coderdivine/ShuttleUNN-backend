const response = require("../utils/response");
const DeviceService = require("../services/device.service");
const CustomError = require("../utils/custom-error");

class DeviceController {

    async getDeviceDetails(req, res) {
        try {
            if (!req.params) throw new CustomError("No parameter passed.", 400);
            const result = await DeviceService.getDeviceDetails({ devsensor_id: req.params.devsensor_id });
            if(!result) throw new CustomError("No result returned. Please make sure your device is activated.", 400);
            res.status(200).send(response("Wifi strength detected", result));
        } catch (error) {
            throw new CustomError(
                "An issue has arisen. Please try again later.",
                500
              );
        }
    }

    async updateDevice(req, res) {
      try {
            const result = await DeviceService.updateDevice(req.body.devsensor_id, req.body)
            if(!result) throw new CustomError("No result returned. Please make sure your device is activated.", 400);
            res.status(200).send(response("Device Updated.", result));
      } catch (error) {
        throw new CustomError(
          "An issue has arisen. Please try again later.",
          500
        );
      }
    }

  async getWifiStrength(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const result = await DeviceService.getWifiStrength({
        devsensor_id: req.params.devsensor_id,
        wifi_strength: req.params.wifi_strength,
      });
      res.status(200).send(response("Wifi strength detected", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async getBatteryLevel(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, battery_level } = req.params;
      const result = await DeviceService.getBatteryLevel({
        devsensor_id,
        battery_level,
      });
      res.status(201).send(response("Battery Level", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async getBatteryHealth(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, battery_health } = req.params;
      const result = await DeviceService.getBatteryHealth({
        devsensor_id,
        battery_health,
      });
      res.status(201).send(response("Battery health.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async getDevicehealth(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, device_health } = req.params;
      const result = await DeviceService.getDevicehealth({
        devsensor_id,
        device_health,
      });
      res.status(201).send(response("Device health.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async getDeviceMemory(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, device_memory } = req.params;
      const result = await DeviceService.getDeviceMemory({
        devsensor_id,
        device_memory,
      });
      res.status(201).send(response("Device memory.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async getDeviceAge(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, device_age } = req.params;
      const result = await DeviceService.getDeviceAge({
        devsensor_id,
        device_age,
      });
      res.status(201).send(response("Device Age.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async trackFrequency(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id, frequency } = req.params;
      const result = await DeviceService.trackFrequency({
        devsensor_id,
        frequency,
      });
      res.status(201).send(response("Track frequency.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async disableDevice(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id } = req.params;
      const result = await DeviceService.disableDevice({ devsensor_id });
      res.status(201).send(response("Dev Sensor disabled.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async enableDevice(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id } = req.params;
      const result = await DeviceService.enableDevice({ devsensor_id });
      res.status(201).send(response("Developer Sensor enabled.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async disconnectWifi(req, res) {
    try {
      if (!req.params) throw new CustomError("No parameter passed.", 400);
      const { devsensor_id } = req.params;
      const result = await DeviceService.disconnectWifi({ devsensor_id });
      res.status(201).send(response("Wifi Disconnected.", result));
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

}

module.exports = new DeviceController();
