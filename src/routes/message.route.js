const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const MessageCtrl = require("../controllers/message.controller");

router.post("/", MessageCtrl.sendMessage);
router.get("/:user_id", MessageCtrl.getMessages);


module.exports = router;
