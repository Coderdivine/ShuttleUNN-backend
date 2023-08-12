const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const UserCtrl = require("../controllers/user.controller");
const sharp = require("sharp");



module.exports = router;