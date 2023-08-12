const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
//const upload = require("../middlewares/multer.middleware");
//const ProductCtrl = require("../controllers/product.controller");
const UserCtrl = require("../controllers/user.controller");
const sharp = require("sharp");



router.post("/register",UserCtrl.register);
router.post("/login",UserCtrl.login);
router.post("/dlt",UserCtrl.dlt);
router.get("/user-data/:user_id",UserCtrl.user_data);
router.post("/reset-password",UserCtrl.resetPassword);
router.post("/verify-reset-password",UserCtrl.verifyResetToken);
router.post("/update-ifno",UserCtrl.updateInfo);



module.exports = router;
