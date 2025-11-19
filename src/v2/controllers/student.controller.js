const response = require("../utils/response");
const StudentService = require("../services/student.service");
const CustomError = require("../utils/custom-error");

class StudentController {
  async register(req, res, next) {
    try {
      if (!req.body) throw new CustomError("No request body", 400);

      const result = await StudentService.register(req.body);
      if (!result) throw new CustomError("Oops! Registration failed", 500);

      return res.status(201).send(response("Registration completed successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      if (!req.body) throw new CustomError("No request body", 400);

      const result = await StudentService.login(req.body);
      if (!result) throw new CustomError("Oops! Login failed", 500);

      return res.status(200).send(response("Login successful", result));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { student_id } = req.params;

      const result = await StudentService.getProfile(student_id);
      if (!result) throw new CustomError("Failed to fetch profile", 500);

      return res.status(200).send(response("Profile fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { student_id } = req.params;
      const updateData = req.body;

      const result = await StudentService.updateProfile(student_id, updateData);
      if (!result) throw new CustomError("Failed to update profile", 500);

      return res.status(200).send(response("Profile updated successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { student_id } = req.params;
      const { oldPassword, newPassword } = req.body;

      const result = await StudentService.changePassword(student_id, oldPassword, newPassword);
      if (!result) throw new CustomError("Failed to change password", 500);

      return res.status(200).send(response("Password changed successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async getWalletBalance(req, res, next) {
    try {
      const { student_id } = req.params;

      const result = await StudentService.getWalletBalance(student_id);
      if (!result) throw new CustomError("Failed to fetch wallet balance", 500);

      return res.status(200).send(response("Wallet balance fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async topupWallet(req, res, next) {
    try {
      const { student_id } = req.params;
      const { amount, paymentMethod } = req.body;

      const result = await StudentService.topupWallet(student_id, amount, paymentMethod);
      if (!result) throw new CustomError("Failed to topup wallet", 500);

      return res.status(200).send(response("Wallet topped up successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async debitWallet(req, res, next) {
    try {
      const { student_id } = req.params;
      const { amount, description, booking_id } = req.body;

      const result = await StudentService.debitWallet(student_id, amount, description, booking_id);
      if (!result) throw new CustomError("Failed to debit wallet", 500);

      return res.status(200).send(response("Wallet debited successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const { student_id } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      const result = await StudentService.getTransactionHistory(student_id, parseInt(limit), parseInt(skip));
      if (!result) throw new CustomError("Failed to fetch transaction history", 500);

      return res.status(200).send(response("Transaction history fetched successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async suspendAccount(req, res, next) {
    try {
      const { student_id } = req.params;
      const { reason } = req.body;

      const result = await StudentService.suspendAccount(student_id, reason);
      if (!result) throw new CustomError("Failed to suspend account", 500);

      return res.status(200).send(response("Account suspended successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async unsuspendAccount(req, res, next) {
    try {
      const { student_id } = req.params;

      const result = await StudentService.unsuspendAccount(student_id);
      if (!result) throw new CustomError("Failed to unsuspend account", 500);

      return res.status(200).send(response("Account unsuspended successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
