const router = require("express").Router();
const WaitListCTRl = require("../controllers/waitlist.controller");

router.post("/join", WaitListCTRl.joinWailist);
router.post("/messageme", WaitListCTRl.sendMessage);

module.exports = router;
