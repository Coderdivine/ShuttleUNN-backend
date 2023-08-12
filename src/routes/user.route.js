const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
const UserCtrl = require("../controllers/user.controller");
const sharp = require("sharp");

router.post("/register", UserCtrl.register);
router.post("/login", UserCtrl.login);
router.post("/dlt", UserCtrl.dlt);
router.get("/user-data/:user_id", UserCtrl.user_data);
router.post("/reset-password", UserCtrl.resetPassword);
router.post("/verify-reset-password", UserCtrl.verifyResetToken);
router.post("/update-info", UserCtrl.updateInfo);
router.post("/suspend-account", UserCtrl.suspendAccount);
router.post("/release-account", UserCtrl.realeaseAccount);
router.get("/user-billing/:user_id", UserCtrl.userBilling);
router.post("/add-to-billing", UserCtrl.addToUserbilling);
router.get("/get-routine/:user_id", UserCtrl.getUserRoutine);
router.post("/add-to-routine", UserCtrl.addToUserRoutine);
router.post("/edit-routine", UserCtrl.editUserRoutine);
router.post("/delete-routine", UserCtrl.deleteFromUserRoutine);

module.exports = router;
