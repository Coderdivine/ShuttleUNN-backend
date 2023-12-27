const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const TrackCtrl = require("../controllers/track.controller");


router.post("/posture", TrackCtrl.trackPosture);
router.post("/last-body-affected", TrackCtrl.lastBodyPartAffected);

module.exports = router;
