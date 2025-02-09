const response = require("../utils/response");
const DeviceService = require("../services/device.service");
const CustomError = require("../utils/custom-error");

class DeviceController {
  async getDeviceDetails(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await DeviceService.getDeviceDetails({
      devsensor_id: req.params.devsensor_id,
    });
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Device information", result));
  }

  async updateDevice(req, res) {
    const result = await DeviceService.updateDevice(
      req.body.devsensor_id,
      req.body
    );
    if (!result)
      throw new CustomError(
        "No result returned. Please make sure your device is activated.",
        400
      );
    res.status(200).send(response("Device Updated.", result));
  }

  async getWifiStrength(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const result = await DeviceService.getWifiStrength({
      devsensor_id: req.params.devsensor_id,
      wifi_strength: req.params.wifi_strength,
    });
    res.status(200).send(response("Wifi strength detected", result));
  }

  async getBatteryLevel(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, battery_level } = req.params;
    const result = await DeviceService.getBatteryLevel({
      devsensor_id,
      battery_level,
    });
    res.status(201).send(response("Battery Level", result));
  }

  async getBatteryHealth(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, battery_health } = req.params;
    const result = await DeviceService.getBatteryHealth({
      devsensor_id,
      battery_health,
    });
    res.status(201).send(response("Battery health.", result));
  }

  async getDevicehealth(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, device_health } = req.params;
    const result = await DeviceService.getDevicehealth({
      devsensor_id,
      device_health,
    });
    res.status(201).send(response("Device health.", result));
  }

  async getDeviceMemory(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, device_memory } = req.params;
    const result = await DeviceService.getDeviceMemory({
      devsensor_id,
      device_memory,
    });
    res.status(201).send(response("Device memory.", result));
  }

  async getDeviceAge(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, device_age } = req.params;
    const result = await DeviceService.getDeviceAge({
      devsensor_id,
      device_age,
    });
    res.status(201).send(response("Device Age.", result));
  }

  async trackFrequency(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, frequency } = req.params;
    const result = await DeviceService.trackFrequency({
      devsensor_id,
      frequency,
    });
    res.status(201).send(response("Track frequency.", result));
  }

  async disableDevice(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id } = req.params;
    const result = await DeviceService.disableDevice({ devsensor_id });
    res.status(201).send(response("Dev Sensor disabled.", result));
  }

  async enableDevice(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id } = req.params;
    const result = await DeviceService.enableDevice({ devsensor_id });
    res.status(201).send(response("Developer Sensor enabled.", result));
  }

  async disconnectWifi(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id } = req.params;
    const result = await DeviceService.disconnectWifi({ devsensor_id });
    res.status(201).send(response("Wifi Disconnected.", result));
  }

  async onStart(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id } = req.params;
    const result = await DeviceService.onStart(devsensor_id);
    res.status(201).send(response("Device is tracking.", result));
  }

  async isActive(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id } = req.params;
    const result = await DeviceService.isActive(devsensor_id);
    res.status(201).send(response("recently tracked?", result));
  }

  async syncDevice(req, res) {
    if (!req.body) throw new CustomError("No parameter passed.", 400);
    const { devsensor_id, generatedCode, access } = req.body;
    const result = await DeviceService.syncDevice(devsensor_id, generatedCode, access);
    res.status(201).send(response("Device Synced", result));
  }

  async checkIfDeviceIsSynced(req, res) {
    if (!req.params) throw new CustomError("No parameter passed.", 400);
    const { link_code } = req.params;
    const result = await DeviceService.checkIfDeviceIsSynced(link_code);
    res.status(201).send(response("Device Synced", result));
  }

}

module.exports = new DeviceController();
