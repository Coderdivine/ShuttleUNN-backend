const router = require("express").Router();
//router.use(require("./../middlewares/trim-incoming-requests.middleware"))

// ShuttleUNN API Routes
router.use("/v2/student", require("./student.route"));
router.use("/v2/driver", require("./driver.route"));
router.use("/v2/booking", require("./booking.route"));
router.use("/v2/route", require("./route.route"));
router.use("/v2/shuttle", require("./shuttle.route"));
router.use("/v2/support", require("./support.route"));

// Legacy user routes (kept for backward compatibility)
router.use("/v2/user", require("./user.route"));

router.get("/", (req, res) => {
    return res.status(200).json({ 
        message: "ShuttleUNN Backend API",
        version: "2.0",
        status: "operational" 
    });
});

module.exports = router;