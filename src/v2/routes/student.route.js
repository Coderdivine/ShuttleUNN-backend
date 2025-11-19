const express = require("express");
const router = express.Router();
const StudentController = require("../controllers/student.controller");
const PaymentController = require("../controllers/payment.controller");
const QRPaymentController = require("../controllers/qrpayment.controller");

// Authentication endpoints
router.post("/register", StudentController.register);
router.post("/login", StudentController.login);

// Profile endpoints
router.get("/profile/:student_id", StudentController.getProfile);
router.put("/profile/:student_id", StudentController.updateProfile);
router.put("/change-password/:student_id", StudentController.changePassword);

// Wallet endpoints
router.get("/wallet/balance/:student_id", StudentController.getWalletBalance);
router.post("/wallet/topup/:student_id", StudentController.topupWallet);
router.post("/wallet/debit/:student_id", StudentController.debitWallet);

// Payment endpoints (Paystack)
router.post("/wallet/initialize-payment/:student_id", PaymentController.initializePayment);
router.get("/wallet/verify-payment", PaymentController.verifyPayment);
router.get("/wallet/transactions/:student_id", PaymentController.getWalletTransactions);

// Bank verification endpoints
router.get("/banks", PaymentController.getBankList);
router.post("/verify-account", PaymentController.verifyBankAccount);

// QR Payment endpoints
router.post("/scan-qr", QRPaymentController.scanQRCode);
router.post("/pay-with-qr/:student_id", QRPaymentController.processQRPayment);

// Transaction endpoints
router.get("/transactions/:student_id", StudentController.getTransactionHistory);

// Account management endpoints
router.post("/suspend/:student_id", StudentController.suspendAccount);
router.post("/unsuspend/:student_id", StudentController.unsuspendAccount);

module.exports = router;
