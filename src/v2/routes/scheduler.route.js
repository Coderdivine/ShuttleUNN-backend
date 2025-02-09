const router = require("express").Router();
router.use(require("../middlewares/trim-incoming-requests.middleware"))
const PoseCtrl = require("../controllers/scheduler.controller");
const upload = require("../utils/multer");

router.post("/add", PoseCtrl.add);
router.post("/get/", PoseCtrl.get);
router.post("/edit/", PoseCtrl.edit);
router.post("/dlt/", PoseCtrl.dlt);
router.post("/chat/:devsensor_id/", upload.single("audio"), PoseCtrl.sendChat);
router.get("/check-schedule/:devsensor_id", PoseCtrl.checkSchedules);
router.get("/recent-chat/:devsensor_id", PoseCtrl.recentChat);

module.exports = router;
