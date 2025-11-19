const response = require("../utils/response");
const PaymentService = require("../services/payment.service");
const CustomError = require("../utils/custom-error");

class PaymentController {
  /**
   * Initialize Paystack payment
   */
  async initializePayment(req, res, next) {
    try {
      const { student_id } = req.params;
      const { amount, email } = req.body;

      if (!amount || amount <= 0) {
        throw new CustomError("Amount must be greater than 0", 400);
      }

      if (!email) {
        throw new CustomError("Email is required", 400);
      }

      const result = await PaymentService.initializePayment(
        student_id,
        amount,
        email
      );

      if (!result) {
        throw new CustomError("Failed to initialize payment", 500);
      }

      return res
        .status(200)
        .send(response("Payment initialized successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Paystack payment
   */
  async verifyPayment(req, res, next) {
    try {
      const { reference } = req.query;

      if (!reference) {
        throw new CustomError("Payment reference is required", 400);
      }

      const result = await PaymentService.verifyPayment(reference);

      if (!result) {
        throw new CustomError("Failed to verify payment", 500);
      }

      return res
        .status(200)
        .send(response("Payment verified successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet top-up transactions
   */
  async getWalletTransactions(req, res, next) {
    try {
      const { student_id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const result = await PaymentService.getWalletTransactions(
        student_id,
        parseInt(limit),
        parseInt(offset)
      );

      return res
        .status(200)
        .send(response("Wallet transactions retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get list of Nigerian banks from Paystack
   */
  async getBankList(req, res, next) {
    try {
      const banks = await PaymentService.getBankList();

      return res
        .status(200)
        .send(response("Bank list retrieved successfully", banks));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify bank account number with Paystack
   */
  async verifyBankAccount(req, res, next) {
    try {
      const { accountNumber, bankCode } = req.body;

      if (!accountNumber || !bankCode) {
        throw new CustomError("Account number and bank code are required", 400);
      }

      const result = await PaymentService.verifyBankAccount(
        accountNumber,
        bankCode
      );

      return res
        .status(200)
        .send(response("Bank account verified successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
