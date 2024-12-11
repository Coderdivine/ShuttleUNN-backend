const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const PostureCtrl = require("../controllers/posture.controller");

router.post("/add", PostureCtrl.addPostures);
router.post("/link-device", PostureCtrl.linkDevSensorId);
router.get("/postures", PostureCtrl.getAllPostures);
router.get("/user-posture/:user_id", PostureCtrl.getUserPostures);
router.post("/daily", PostureCtrl.getPostureSummaryOfTheDay);
router.post("/monthly", PostureCtrl.getPostureSummaryOfTheMonth);
router.post("/weekly", PostureCtrl.getPostureSummaryOfTheWeek);
router.post("/yearly", PostureCtrl.getPostureSummaryOfTheYear);
router.post("/six-posture", PostureCtrl.lastSixPosturesImage);
router.post("/common-posture", PostureCtrl.fiveCommonPostures);
router.post("/posture-period", PostureCtrl.groupPosturesByPeriod);
router.post("/predict-workout", PostureCtrl.predictWorkout);
router.post("/last-summary", PostureCtrl.postureSummary);


module.exports = router;
