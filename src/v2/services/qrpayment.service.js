require("dotenv").config();
const Student = require("../models/student.model");
const Driver = require("../models/driver.model");
const Transaction = require("../models/transaction.model");
const CustomError = require("../utils/custom-error");
const { v4: uuidv4 } = require("uuid");

class QRPaymentService {
  /**
   * Generate QR code data for driver
   * @param {string} driver_id - Driver ID
   * @param {number} fare - Ride fare amount
   * @param {string} route - Route name/description
   * @returns {Object} QR code data
   */
  async generateQRCode(driver_id, fare, route) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!fare || fare <= 0) {
      throw new CustomError("Fare must be greater than 0", 400);
    }
    if (!route) {
      throw new CustomError("Route is required", 400);
    }

    // Verify driver exists
    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    if (!driver.isActive) {
      throw new CustomError("Driver account is inactive", 403);
    }

    // Generate unique QR reference
    const qrReference = `QR-${uuidv4().slice(0, 12).toUpperCase()}`;

    // Create QR data object
    const qrData = {
      reference: qrReference,
      driver_id: driver_id,
      driver_name: `${driver.firstName} ${driver.lastName}`,
      fare: fare,
      route: route,
      vehicle: driver.vehicleInfo?.registrationNumber || "N/A",
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
    };

    return qrData;
  }

  /**
   * Scan and decode QR code (student scans driver's QR)
   * @param {string} qrReference - QR code reference
   * @returns {Object} Ride details from QR
   */
  async scanQRCode(qrReference) {
    if (!qrReference) {
      throw new CustomError("QR reference is required", 400);
    }

    // In a real implementation, you would store QR codes in a collection
    // For now, we'll validate the format and return instructions
    if (!qrReference.startsWith("QR-")) {
      throw new CustomError("Invalid QR code format", 400);
    }

    // Extract driver_id from QR reference (this is simplified)
    // In production, store QR codes in database with expiration
    return {
      message: "QR code scanned successfully",
      instructions: "Proceed to payment to complete transaction",
    };
  }

  /**
   * Process QR code payment
   * @param {string} student_id - Student ID
   * @param {string} driver_id - Driver ID
   * @param {number} fare - Payment amount
   * @param {string} route - Route description
   * @param {string} qrReference - QR reference code
   * @returns {Object} Payment result
   */
  async processQRPayment(student_id, driver_id, fare, route, qrReference) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!fare || fare <= 0) {
      throw new CustomError("Fare must be greater than 0", 400);
    }

    // Get student
    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Check wallet balance
    if (student.walletBalance < fare) {
      throw new CustomError(
        `Insufficient balance. Current: ₦${student.walletBalance.toFixed(
          2
        )}, Required: ₦${fare.toFixed(2)}`,
        400
      );
    }

    // Verify driver exists
    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Deduct from student wallet
    const previousBalance = student.walletBalance;
    const newBalance = previousBalance - fare;

    student.walletBalance = newBalance;
    await student.save();

    // Create transaction record
    const transaction = new Transaction({
      transaction_id: uuidv4(),
      student_id,
      amount: fare,
      type: "debit",
      paymentMethod: "qrcode",
      status: "completed",
      description: `QR Payment - ${route} with ${driver.firstName} ${driver.lastName}`,
      reference: qrReference || `QR-${uuidv4().slice(0, 8).toUpperCase()}`,
      previousBalance,
      newBalance,
    });

    const savedTransaction = await transaction.save();

    return {
      message: "Payment successful",
      transaction: savedTransaction.toObject(),
      wallet: {
        student_id: student.student_id,
        walletBalance: student.walletBalance,
      },
      paymentDetails: {
        driver_name: `${driver.firstName} ${driver.lastName}`,
        vehicle: driver.vehicleInfo?.registrationNumber || "N/A",
        route: route,
        fare: fare,
        paidAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = new QRPaymentService();
