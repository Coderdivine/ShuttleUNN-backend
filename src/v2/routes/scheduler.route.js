const router = require("express").Router();
router.use(require("../middlewares/trim-incoming-requests.middleware"))
const PoseCtrl = require("../controllers/scheduler.controller");



router.post("/add", PoseCtrl.add);
router.post("/get/", PoseCtrl.get);
router.post("/edit/", PoseCtrl.edit);
router.post("/dlt/", PoseCtrl.dlt);


module.exports = router;
