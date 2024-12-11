const router = require("express").Router();
//router.use(require("./../middlewares/trim-incoming-requests.middleware"))
router.use("/v2/user", require("./user.route"));
router.use("/v2/workout", require("./workout.route"));
router.use("/v2/posture", require("./posture.route"));
router.use("/v2/device", require("./device.route"));
router.use("/v2/pose", require("./pose.route"));
router.use("/v2/schedule", require("./scheduler.route"));
router.use("/v2/track", require("./track.route"));
router.use("/v2/message", require("./message.route"));
router.use("/v2/waitlist", require("./waitlist.route"));


router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from [https://v2.devsensor.com]" });
});

module.exports = router;