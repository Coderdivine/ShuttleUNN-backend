require("dotenv").config();
const Student = require("../models/student.model");
const Transaction = require("../models/transaction.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { BCRYPT_SALT } = require("../config");

class StudentService {
  async register(data) {
    // Validation
    if (!data.email) throw new CustomError("Email is required", 400);
    if (!data.password) throw new CustomError("Password is required", 400);
    if (!data.firstName) throw new CustomError("First name is required", 400);
    if (!data.lastName) throw new CustomError("Last name is required", 400);
    if (!data.phone) throw new CustomError("Phone number is required", 400);
    if (!data.regNumber) throw new CustomError("Registration number is required", 400);
    if (!data.department) throw new CustomError("Department is required", 400);
    if (!data.username) throw new CustomError("Username is required", 400);

    // Email validation
    if (!data.email.includes("@")) {
      throw new CustomError("Please provide a valid email address", 400);
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email: data.email });
    if (existingEmail) {
      throw new CustomError("Email already registered", 400);
    }

    // Check if username already exists
    const existingUsername = await Student.findOne({ username: data.username.toLowerCase() });
    if (existingUsername) {
      throw new CustomError("Username already taken", 400);
    }

    // Check if registration number already exists
    const existingRegNumber = await Student.findOne({ regNumber: data.regNumber.toUpperCase() });
    if (existingRegNumber) {
      throw new CustomError("Registration number already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT);

    // Create new student
    const newStudent = new Student({
      student_id: uuidv4(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: data.phone.trim(),
      regNumber: data.regNumber.toUpperCase().trim(),
      department: data.department.trim(),
      walletBalance: 0,
      emailVerified: false,
      isActive: true,
    });

    const savedStudent = await newStudent.save();
    if (!savedStudent) {
      throw new CustomError("Failed to register student", 500);
    }

    // Remove password from response
    const studentData = savedStudent.toObject();
    delete studentData.password;

    return studentData;
  }

  async login(data) {
    if (!data.email && !data.username) {
      throw new CustomError("Email or username is required", 400);
    }
    if (!data.password) {
      throw new CustomError("Password is required", 400);
    }

    // Find student by email or username
    const student = await Student.findOne({
      $or: [
        { email: data.email?.toLowerCase() },
        { username: data.username?.toLowerCase() },
      ],
    }).select("+password");

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    if (!student.isActive) {
      throw new CustomError("Account is inactive", 403);
    }

    if (student.isSuspended) {
      throw new CustomError("Account has been suspended", 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, student.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid password", 401);
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    // Return student without password
    const studentData = student.toObject();
    delete studentData.password;

    return studentData;
  }

  async getProfile(student_id) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    const studentData = student.toObject();
    delete studentData.password;

    return studentData;
  }

  async updateProfile(student_id, data) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Check if email is being updated and if it's already in use
    if (data.email && data.email !== student.email) {
      const existingEmail = await Student.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        throw new CustomError("Email already in use", 400);
      }
      student.email = data.email.toLowerCase().trim();
    }

    // Check if username is being updated and if it's already in use
    if (data.username && data.username !== student.username) {
      const existingUsername = await Student.findOne({ username: data.username.toLowerCase() });
      if (existingUsername) {
        throw new CustomError("Username already taken", 400);
      }
      student.username = data.username.toLowerCase().trim();
    }

    // Update allowed fields
    if (data.firstName) student.firstName = data.firstName.trim();
    if (data.lastName) student.lastName = data.lastName.trim();
    if (data.phone) student.phone = data.phone.trim();
    if (data.department) student.department = data.department.trim();
    if (data.nfcCardId) student.nfcCardId = data.nfcCardId.trim();

    // Update bank details if provided
    if (data.bankDetails) {
      if (!student.bankDetails) {
        student.bankDetails = {};
      }
      if (data.bankDetails.accountName !== undefined) {
        student.bankDetails.accountName = data.bankDetails.accountName ? data.bankDetails.accountName.trim() : null;
      }
      if (data.bankDetails.accountNumber !== undefined) {
        student.bankDetails.accountNumber = data.bankDetails.accountNumber ? data.bankDetails.accountNumber.trim() : null;
      }
      if (data.bankDetails.bankName !== undefined) {
        student.bankDetails.bankName = data.bankDetails.bankName ? data.bankDetails.bankName.trim() : null;
      }
      if (data.bankDetails.bankCode !== undefined) {
        student.bankDetails.bankCode = data.bankDetails.bankCode ? data.bankDetails.bankCode.trim() : null;
      }
      student.markModified('bankDetails');
    }

    const updatedStudent = await student.save();
    if (!updatedStudent) {
      throw new CustomError("Failed to update profile", 500);
    }

    const studentData = updatedStudent.toObject();
    delete studentData.password;

    return studentData;
  }

  async changePassword(student_id, oldPassword, newPassword) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }
    if (!oldPassword) {
      throw new CustomError("Old password is required", 400);
    }
    if (!newPassword) {
      throw new CustomError("New password is required", 400);
    }

    const student = await Student.findOne({ student_id }).select("+password");
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, student.password);
    if (!isPasswordValid) {
      throw new CustomError("Old password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT);
    student.password = hashedPassword;

    const updatedStudent = await student.save();
    if (!updatedStudent) {
      throw new CustomError("Failed to change password", 500);
    }

    return { message: "Password changed successfully" };
  }

  async getWalletBalance(student_id) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    return {
      student_id: student.student_id,
      walletBalance: student.walletBalance,
      lastUpdated: student.updatedAt,
    };
  }

  async topupWallet(student_id, amount, paymentMethod = "card") {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }
    if (!amount || amount <= 0) {
      throw new CustomError("Amount must be greater than 0", 400);
    }
    if (!["card", "phone", "qrcode", "transfer"].includes(paymentMethod)) {
      throw new CustomError("Invalid payment method", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    const previousBalance = student.walletBalance;
    const newBalance = previousBalance + amount;

    student.walletBalance = newBalance;
    const updatedStudent = await student.save();

    // Create transaction record
    const transaction = new Transaction({
      transaction_id: uuidv4(),
      student_id,
      amount,
      type: "topup",
      paymentMethod,
      status: "completed",
      description: `Wallet topup of ${amount}`,
      reference: `TOPUP-${uuidv4().slice(0, 8).toUpperCase()}`,
      previousBalance,
      newBalance,
    });

    const savedTransaction = await transaction.save();

    return {
      transaction: savedTransaction.toObject(),
      wallet: {
        student_id: updatedStudent.student_id,
        walletBalance: updatedStudent.walletBalance,
      },
    };
  }

  async debitWallet(student_id, amount, description, booking_id = null) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }
    if (!amount || amount <= 0) {
      throw new CustomError("Amount must be greater than 0", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    if (student.walletBalance < amount) {
      throw new CustomError("Insufficient wallet balance", 400);
    }

    const previousBalance = student.walletBalance;
    const newBalance = previousBalance - amount;

    student.walletBalance = newBalance;
    const updatedStudent = await student.save();

    // Create transaction record
    const transaction = new Transaction({
      transaction_id: uuidv4(),
      student_id,
      amount,
      type: "debit",
      paymentMethod: "wallet",
      status: "completed",
      description: description || "Wallet debit",
      reference: `DEBIT-${uuidv4().slice(0, 8).toUpperCase()}`,
      previousBalance,
      newBalance,
      booking_id,
    });

    const savedTransaction = await transaction.save();

    return {
      transaction: savedTransaction.toObject(),
      wallet: {
        student_id: updatedStudent.student_id,
        walletBalance: updatedStudent.walletBalance,
      },
    };
  }

  async getTransactionHistory(student_id, limit = 20, skip = 0) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    const transactions = await Transaction.find({ student_id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Transaction.countDocuments({ student_id });

    return {
      transactions,
      pagination: {
        total: totalCount,
        limit,
        skip,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async suspendAccount(student_id, reason = "") {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    student.isSuspended = true;
    const updatedStudent = await student.save();

    if (!updatedStudent) {
      throw new CustomError("Failed to suspend account", 500);
    }

    return { message: "Account suspended successfully" };
  }

  async unsuspendAccount(student_id) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const student = await Student.findOne({ student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    student.isSuspended = false;
    const updatedStudent = await student.save();

    if (!updatedStudent) {
      throw new CustomError("Failed to unsuspend account", 500);
    }

    return { message: "Account unsuspended successfully" };
  }
}

module.exports = new StudentService();
