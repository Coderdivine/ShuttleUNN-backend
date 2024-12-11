const router = require("express").Router();
router.use(require("../middlewares/trim-incoming-requests.middleware"))
const PoseCtrl = require("../controllers/pose.controller");



router.post("/pose-estimate", PoseCtrl.savePoseEstimation);
router.get("/recent-pose/:devsensor_id/", PoseCtrl.recentPoseEstimate);
router.get("/avg-pose-angle/:devsensor_id/", PoseCtrl.getAvgPoseAngle);
router.get("/pose-score/:devsensor_id/", PoseCtrl.getPoseScore);


module.exports = router;
