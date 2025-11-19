const express = require("express");
const router = express.Router();
const DriverController = require("../controllers/driver.controller");
const PaymentController = require("../controllers/payment.controller");
const QRPaymentController = require("../controllers/qrpayment.controller");

// Authentication endpoints
router.post("/register", DriverController.register);
router.post("/login", DriverController.login);

// Profile endpoints
router.get("/profile/:driver_id", DriverController.getProfile);
router.put("/profile/:driver_id", DriverController.updateProfile);
router.put("/change-password/:driver_id", DriverController.changePassword);

// Status management
router.put("/status/:driver_id", DriverController.updateStatus);

// Route management
router.get("/routes/:driver_id", DriverController.getAssignedRoutes);
router.post("/routes/:driver_id", DriverController.assignRoutes);

// Rating
router.put("/rating/:driver_id", DriverController.updateRating);

// Account management
router.post("/suspend/:driver_id", DriverController.suspendAccount);
router.post("/unsuspend/:driver_id", DriverController.unsuspendAccount);

// QR Payment
router.post("/generate-qr/:driver_id", QRPaymentController.generateQRCode);

// Bank verification endpoints
router.get("/banks", PaymentController.getBankList);
router.post("/verify-account", PaymentController.verifyBankAccount);

module.exports = router;
