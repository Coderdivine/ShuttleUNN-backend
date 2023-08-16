const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const PostureCtrl = require("../controllers/posture.controller");

router.post("/add", PostureCtrl.addPostures);

module.exports = router;
