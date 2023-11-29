require("dotenv").config();
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const UserCtrl = require("../controllers/user.controller");
const sharp = require("sharp");
const passport = require("passport");

router.post("/register", UserCtrl.register);
router.post("/login", UserCtrl.login);
router.post("/dlt", UserCtrl.dlt);
router.get("/user-data/:user_id", UserCtrl.user_data);
router.post("/reset-password", UserCtrl.resetPassword);
router.post("/verify-reset-password", UserCtrl.verifyResetToken);
router.post("/update-info", UserCtrl.updateInfo);
router.post("/register-device", UserCtrl.registerNotifcationDevice);
router.post("/suspend-account", UserCtrl.suspendAccount);
router.post("/release-account", UserCtrl.realeaseAccount);
router.get("/user-billing/:user_id", UserCtrl.userBilling);
router.post("/add-to-billing", UserCtrl.addToUserbilling);
router.get("/get-routine/:user_id", UserCtrl.getUserRoutine);
router.post("/add-to-routine", UserCtrl.addToUserRoutine);
router.post("/edit-routine", UserCtrl.editUserRoutine);
router.post("/delete-routine", UserCtrl.deleteFromUserRoutine);


/* Enabling Google Auth Program */
router.get("/login/failed", UserCtrl.googleAuthFailed);
router.get("/login/success", UserCtrl.googleAuth);
console.log(process.env.CLIENT_URL);
router.get("/google/callback", passport.authenticate("google", 
{ successRedirect: process.env.CLIENT_URL, failureRedirect: "/login/failed" }));
router.get("/google", passport.authenticate("google", [ "profile", "email" ]));
router.get("/google/logout", ( req, res) => {req.logout(), res.redirect(process.env.CLIENT_URL) });

module.exports = router;
