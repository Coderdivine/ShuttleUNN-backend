const router = require("express").Router();
//router.use(require("./../middlewares/trim-incoming-requests.middleware"))
router.use("/user", require("./user.route"));
router.use("/workout", require("./workout.route"));
router.use("/posture", require("./posture.route"));
router.use("/device", require("./device.route"));
router.use("/track", require("./track.route"));
router.use("/waitlist", require("./waitlist.route"));


router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from [https://devsensor.com]" });
});

module.exports = router;
