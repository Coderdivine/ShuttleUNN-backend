const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const DeviceCtrl = require("../controllers/device.controller");

router.get("/device-details", DeviceCtrl.getDeviceDetails);
router.get("/wifi-strength", DeviceCtrl.getWifiStrength);
router.get("/battery-level", DeviceCtrl.getBatteryLevel);
router.get("/battery-health", DeviceCtrl.getBatteryHealth);
router.get("/device-health", DeviceCtrl.getDevicehealth);
router.get("/device-memory", DeviceCtrl.getDeviceMemory);
router.get("/device-age", DeviceCtrl.getDeviceAge);
router.get("/track-frequency", DeviceCtrl.trackFrequency);
router.get("/disable-device", DeviceCtrl.disableDevice);
router.get("/enable-device", DeviceCtrl.enableDevice);
router.get("/disconnect-wifi", DeviceCtrl.disconnectWifi);


module.exports = router;
