const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const MessageCtrl = require("../controllers/message.controller");
const upload = require("../utils/multer");

router.post("/", MessageCtrl.sendMessage);
router.get("/:user_id", MessageCtrl.getMessages);
router.post("/text-to-audio", MessageCtrl.textToAudio);
router.post("/audio-to-text", upload.single("audio"), MessageCtrl.speechToText);


module.exports = router;
