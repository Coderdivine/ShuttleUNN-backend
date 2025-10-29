const router = require("express").Router();
//router.use(require("./../middlewares/trim-incoming-requests.middleware"))
router.use("/v2/user", require("./user.route"));


router.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello world from [https://v2.backend.com]" });
});

module.exports = router;