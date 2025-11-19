require("dotenv").config();
const axios = require("axios");
const Student = require("../models/student.model");
const Transaction = require("../models/transaction.model");
const CustomError = require("../utils/custom-error");
const { v4: uuidv4 } = require("uuid");

// Paystack API configuration (TEST MODE)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackRequest = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

class PaymentService {
  /**
   * Initialize Paystack payment
   * @param {string} student_id - Student ID
   * @param {number} amount - Amount in Naira
   * @param {string} email - Student email
   * @returns {Object} Payment initialization data
   */
  async initializePayment(student_id, amount, email) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }
    if (!amount || amount <= 0) {
      throw new CustomError("Amount must be greater than 0", 400);
    }
    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    // Verify student exists
    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Generate unique reference
    const reference = `TOPUP-${uuidv4().slice(0, 8).toUpperCase()}-${Date.now()}`;

    try {
      // Initialize payment with Paystack (Direct API)
      // Amount must be in kobo (multiply by 100)
      const response = await paystackRequest.post("/transaction/initialize", {
        email: email,
        amount: amount * 100, // Convert to kobo
        reference: reference,
        metadata: {
          student_id: student_id,
          student_name: `${student.firstName} ${student.lastName}`,
          purpose: "Wallet Top-up",
        },
        callback_url: `${process.env.DASHBOARD_URL}/student/wallet?reference=${reference}`,
      });

      if (!response.data.status) {
        throw new CustomError("Failed to initialize payment", 500);
      }

      // Create pending transaction record
      const transaction = new Transaction({
        transaction_id: uuidv4(),
        student_id,
        amount,
        type: "topup",
        paymentMethod: "card",
        status: "pending",
        description: `Wallet topup of ₦${amount}`,
        reference: reference,
        previousBalance: student.walletBalance,
        newBalance: student.walletBalance, // Will be updated on verification
      });

      await transaction.save();

      return {
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: reference,
      };
    } catch (error) {
      console.error("Paystack initialization error:", error);
      throw new CustomError(
        error.message || "Failed to initialize payment",
        error.statusCode || 500
      );
    }
  }

  /**
   * Verify Paystack payment
   * @param {string} reference - Payment reference
   * @returns {Object} Verification result with updated wallet
   */
  async verifyPayment(reference) {
    if (!reference) {
      throw new CustomError("Payment reference is required", 400);
    }

    try {
      // Verify payment with Paystack (Direct API)
      const response = await paystackRequest.get(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new CustomError("Failed to verify payment", 500);
      }

      const paymentData = response.data.data;

      // Check if payment was successful
      if (paymentData.status !== "success") {
        throw new CustomError(
          `Payment verification failed: ${paymentData.status}`,
          400
        );
      }

      // Find the pending transaction
      const transaction = await Transaction.findOne({ reference });
      if (!transaction) {
        throw new CustomError("Transaction not found", 404);
      }

      // Check if already processed
      if (transaction.status === "completed") {
        return {
          message: "Payment already processed",
          transaction: transaction.toObject(),
          wallet: {
            student_id: transaction.student_id,
            walletBalance: transaction.newBalance,
          },
        };
      }

      // Get amount paid in Naira (convert from kobo)
      const amountPaid = paymentData.amount / 100;

      // Verify amount matches
      if (amountPaid !== transaction.amount) {
        transaction.status = "failed";
        await transaction.save();
        throw new CustomError(
          `Amount mismatch: Expected ₦${transaction.amount}, Got ₦${amountPaid}`,
          400
        );
      }

      // Get student and update wallet
      const student = await Student.findOne({
        student_id: transaction.student_id,
      });
      if (!student) {
        throw new CustomError("Student not found", 404);
      }

      const previousBalance = student.walletBalance;
      const newBalance = previousBalance + amountPaid;

      student.walletBalance = newBalance;
      await student.save();

      // Update transaction
      transaction.status = "completed";
      transaction.previousBalance = previousBalance;
      transaction.newBalance = newBalance;
      transaction.description = `Wallet topup of ₦${amountPaid} via Paystack`;
      await transaction.save();

      return {
        message: "Payment verified and wallet updated successfully",
        transaction: transaction.toObject(),
        wallet: {
          student_id: student.student_id,
          walletBalance: student.walletBalance,
        },
        paymentDetails: {
          amount: amountPaid,
          currency: paymentData.currency,
          paid_at: paymentData.paid_at,
          channel: paymentData.channel,
        },
      };
    } catch (error) {
      console.error("Paystack verification error:", error);
      throw new CustomError(
        error.message || "Failed to verify payment",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get wallet top-up transactions for a student
   * @param {string} student_id - Student ID
   * @param {number} limit - Max transactions to return
   * @param {number} offset - Skip transactions
   * @returns {Object} Transactions list
   */
  async getWalletTransactions(student_id, limit = 20, offset = 0) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Fetch only topup transactions
    const transactions = await Transaction.find({
      student_id,
      type: "topup",
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Transaction.countDocuments({
      student_id,
      type: "topup",
    });

    return {
      transactions: transactions.map((t) => t.toObject()),
      total,
      limit,
      offset,
      hasMore: offset + transactions.length < total,
    };
  }

  /**
   * Get list of Nigerian banks from Paystack
   * @returns {Array} List of banks with name and code
   */
  async getBankList() {
    try {
      const response = await paystackRequest.get("/bank", {
        params: {
          country: "nigeria",
          perPage: 100,
        },
      });

      if (!response.data.status) {
        throw new CustomError("Failed to fetch bank list", 500);
      }

      // Return banks sorted alphabetically
      return response.data.data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Paystack bank list error:", error);
      throw new CustomError(
        error.message || "Failed to fetch bank list",
        error.statusCode || 500
      );
    }
  }

  /**
   * Verify bank account number with Paystack
   * @param {string} accountNumber - Bank account number
   * @param {string} bankCode - Bank code from Paystack
   * @returns {Object} Account details including account name
   */
  async verifyBankAccount(accountNumber, bankCode) {
    if (!accountNumber || !bankCode) {
      throw new CustomError("Account number and bank code are required", 400);
    }

    // Validate account number format (Nigerian accounts are 10 digits)
    if (!/^\d{10}$/.test(accountNumber)) {
      throw new CustomError(
        "Invalid account number format. Must be 10 digits",
        400
      );
    }

    try {
      const response = await paystackRequest.get("/bank/resolve", {
        params: {
          account_number: accountNumber,
          bank_code: bankCode,
        },
      });

      if (!response.data.status) {
        throw new CustomError(
          response.data.message || "Failed to verify account",
          400
        );
      }

      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
        bankCode: bankCode,
      };
    } catch (error) {
      console.error("Paystack account verification error:", error);
      
      // Handle specific Paystack errors
      if (error.response?.data?.message) {
        throw new CustomError(error.response.data.message, 400);
      }
      
      throw new CustomError(
        error.message || "Failed to verify bank account",
        error.statusCode || 500
      );
    }
  }
}

module.exports = new PaymentService();
