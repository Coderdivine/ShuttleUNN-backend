const response = require("../utils/response");
const QRPaymentService = require("../services/qrpayment.service");
const CustomError = require("../utils/custom-error");

class QRPaymentController {
  /**
   * Generate QR code for driver
   */
  async generateQRCode(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { fare, route } = req.body;

      if (!fare || fare <= 0) {
        throw new CustomError("Fare must be greater than 0", 400);
      }

      if (!route) {
        throw new CustomError("Route is required", 400);
      }

      const result = await QRPaymentService.generateQRCode(
        driver_id,
        fare,
        route
      );

      if (!result) {
        throw new CustomError("Failed to generate QR code", 500);
      }

      return res
        .status(200)
        .send(response("QR code generated successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Scan QR code (student scans)
   */
  async scanQRCode(req, res, next) {
    try {
      const { qrReference } = req.body;

      if (!qrReference) {
        throw new CustomError("QR reference is required", 400);
      }

      const result = await QRPaymentService.scanQRCode(qrReference);

      if (!result) {
        throw new CustomError("Failed to scan QR code", 500);
      }

      return res
        .status(200)
        .send(response("QR code scanned successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process QR payment
   */
  async processQRPayment(req, res, next) {
    try {
      const { student_id } = req.params;
      const { driver_id, fare, route, qrReference } = req.body;

      if (!driver_id) {
        throw new CustomError("Driver ID is required", 400);
      }

      if (!fare || fare <= 0) {
        throw new CustomError("Fare must be greater than 0", 400);
      }

      if (!route) {
        throw new CustomError("Route is required", 400);
      }

      const result = await QRPaymentService.processQRPayment(
        student_id,
        driver_id,
        fare,
        route,
        qrReference
      );

      if (!result) {
        throw new CustomError("Payment processing failed", 500);
      }

      return res
        .status(200)
        .send(response("Payment completed successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRPaymentController();
