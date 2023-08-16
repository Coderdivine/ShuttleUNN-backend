const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const DeviceCtrl = require("../controllers/device.controller");

router.get("/device-details/:devsensor_id", DeviceCtrl.getDeviceDetails);
router.get("/wifi-strength/:devsensor_id/:wifi_strength", DeviceCtrl.getWifiStrength);
router.get("/battery-level/:devsensor_id/:battery_level", DeviceCtrl.getBatteryLevel);
router.get("/battery-health/:devsensor_id/:battery_health", DeviceCtrl.getBatteryHealth);
router.get("/device-health/:devsensor_id/:device_health", DeviceCtrl.getDevicehealth);
router.get("/device-memory/:devsensor_id/:device_memory", DeviceCtrl.getDeviceMemory);
router.get("/device-age/:devsensor_id/:device_age", DeviceCtrl.getDeviceAge);
router.get("/track-frequency/:devsensor_id/:frequency", DeviceCtrl.trackFrequency);
router.get("/disable-device/:devsensor_id", DeviceCtrl.disableDevice);
router.get("/enable-device/:devsensor_id", DeviceCtrl.enableDevice);
router.get("/disconnect-wifi/:devsensor_id", DeviceCtrl.disconnectWifi);


module.exports = router;
