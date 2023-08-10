//const { role } = require("../config");
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware")();
//const upload = require("../middlewares/multer.middleware");
//const ProductCtrl = require("../controllers/product.controller");
const UserCtrl = require("../controllers/user.controller");
const AICtrl = require("../controllers/ai.controller");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (request, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + ".png" // Save file with .png extension
    );
  },
});

const upload = multer({ storage: storage });
/* 
const convertToPNG = (request, response, next) => {
    sharp(request.file.path)
      .toFormat("png")
      .toFile(path.join(path.dirname(request.file.path), `${request.file.filename}`), (error) => {
        if (error) {
          return next(error);
        }
        next();
      });
}; 
*/
const convertToPNG = (request, response, next) => {
    const fileExtension = path.extname(request.file.originalname);
    const isPNG = fileExtension.toLowerCase() === ".png";
  
    if (isPNG) {
      // File is already in PNG format, no need to convert
      return next();
    }
  
    const convertedFileName = `${request.file.filename}.png`;
    const convertedFilePath = path.join(path.dirname(request.file.path), convertedFileName);
  
    sharp(request.file.path)
      .toFormat("png")
      .toFile(convertedFilePath, (error) => {
        if (error) {
          return next(error);
        }
        // Update the request.file properties to reflect the converted file
        request.file.filename = convertedFileName;
        request.file.path = convertedFilePath;
  
        next();
      });
};
  


router.post("/register",UserCtrl.register);
router.post("/login",UserCtrl.login);
router.post("/dlt",UserCtrl.dlt);
router.get("/user-data/:user_id",UserCtrl.user_data);
router.post("/reset-password",UserCtrl.resetPassword);
router.post("/verify-reset-password",UserCtrl.verifyResetToken);
router.post("/update-ifno",UserCtrl.updateInfo);

/* AI controller  */

router.post("/upload-image/:user_id",upload.single("image"), convertToPNG, AICtrl.uploadImage);
router.post("/create-image",upload.fields([
{ name: 'ai_images', maxCount: 1 },
{ name: 'images', maxCount: 1 }
]), AICtrl.createImage);
router.get("/gallery",AICtrl.getGallery);
router.get("/user-gallery/:user_id",AICtrl.getUserGallery);






/**
 * @apiIgnore Not to be used
 *
 * @apiVersion 0.1.0
 * @api {delete} /users/:userid 8. Delete user
 * @apiPermission admin
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {string} userId The User ID...
 */

module.exports = router;
