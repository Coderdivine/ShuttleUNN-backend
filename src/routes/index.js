const router = require("express").Router();
router.use(require("./../middlewares/trim-incoming-requests.middleware"))
router.use("/user", require("./user.route"));
router.use("/flw", require("./flutterwave.route"));

router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from [https://redesign.axgura.com]" });
});

module.exports = router;
