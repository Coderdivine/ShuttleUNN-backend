require("dotenv").config();
const Driver = require("../models/driver.model");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { BCRYPT_SALT } = require("../config");

class DriverService {
  async register(data) {
    // Validation
    if (!data.email) throw new CustomError("Email is required", 400);
    if (!data.password) throw new CustomError("Password is required", 400);
    if (!data.firstName) throw new CustomError("First name is required", 400);
    if (!data.lastName) throw new CustomError("Last name is required", 400);
    if (!data.phone) throw new CustomError("Phone number is required", 400);
    if (!data.license) throw new CustomError("License is required", 400);
    if (!data.licenseNumber) throw new CustomError("License number is required", 400);
    if (!data.licenseExpiry) throw new CustomError("License expiry date is required", 400);
    if (!data.username) throw new CustomError("Username is required", 400);
    if (!data.vehicleInfo) throw new CustomError("Vehicle information is required", 400);

    // Email validation
    if (!data.email.includes("@")) {
      throw new CustomError("Please provide a valid email address", 400);
    }

    // Check if email already exists
    const existingEmail = await Driver.findOne({ email: data.email });
    if (existingEmail) {
      throw new CustomError("Email already registered", 400);
    }

    // Check if username already exists
    const existingUsername = await Driver.findOne({ username: data.username.toLowerCase() });
    if (existingUsername) {
      throw new CustomError("Username already taken", 400);
    }

    // Check if license number already exists
    const existingLicense = await Driver.findOne({ licenseNumber: data.licenseNumber.toUpperCase() });
    if (existingLicense) {
      throw new CustomError("License number already registered", 400);
    }

    // Check if vehicle registration already exists
    if (data.vehicleInfo?.registrationNumber) {
      const existingVehicle = await Driver.findOne({
        "vehicleInfo.registrationNumber": data.vehicleInfo.registrationNumber.toUpperCase(),
      });
      if (existingVehicle) {
        throw new CustomError("Vehicle already registered", 400);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT);

    // Create new driver
    const newDriver = new Driver({
      driver_id: uuidv4(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: data.phone.trim(),
      license: data.license.trim(),
      licenseNumber: data.licenseNumber.toUpperCase().trim(),
      licenseExpiry: new Date(data.licenseExpiry),
      vehicleInfo: {
        registrationNumber: data.vehicleInfo.registrationNumber.toUpperCase().trim(),
        make: data.vehicleInfo.make?.trim(),
        model: data.vehicleInfo.model?.trim(),
        capacity: data.vehicleInfo.capacity,
        color: data.vehicleInfo.color?.trim(),
      },
      rating: 5,
      ratingCount: 0,
      status: "inactive",
      isActive: true,
    });

    const savedDriver = await newDriver.save();
    if (!savedDriver) {
      throw new CustomError("Failed to register driver", 500);
    }

    // Remove password from response
    const driverData = savedDriver.toObject();
    delete driverData.password;

    return driverData;
  }

  async login(data) {
    if (!data.email && !data.username) {
      throw new CustomError("Email or username is required", 400);
    }
    if (!data.password) {
      throw new CustomError("Password is required", 400);
    }

    // Find driver by email or username
    const driver = await Driver.findOne({
      $or: [
        { email: data.email?.toLowerCase() },
        { username: data.username?.toLowerCase() },
      ],
    }).select("+password");

    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    if (!driver.isActive) {
      throw new CustomError("Account is inactive", 403);
    }

    if (driver.isSuspended) {
      throw new CustomError("Account has been suspended", 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, driver.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid password", 401);
    }

    // Update last login and status to active
    driver.lastLogin = new Date();
    driver.status = "active";
    await driver.save();

    // Return driver without password
    const driverData = driver.toObject();
    delete driverData.password;

    return driverData;
  }

  async getProfile(driver_id) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    const driverData = driver.toObject();
    delete driverData.password;

    return driverData;
  }

  async updateProfile(driver_id, data) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Check if email is being updated and if it's already in use
    if (data.email && data.email !== driver.email) {
      const existingEmail = await Driver.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        throw new CustomError("Email already in use", 400);
      }
      driver.email = data.email.toLowerCase().trim();
    }

    // Check if username is being updated and if it's already in use
    if (data.username && data.username !== driver.username) {
      const existingUsername = await Driver.findOne({ username: data.username.toLowerCase() });
      if (existingUsername) {
        throw new CustomError("Username already taken", 400);
      }
      driver.username = data.username.toLowerCase().trim();
    }

    // Update allowed fields
    if (data.firstName) driver.firstName = data.firstName.trim();
    if (data.lastName) driver.lastName = data.lastName.trim();
    if (data.phone) driver.phone = data.phone.trim();
    if (data.license) driver.license = data.license.trim();
    if (data.licenseExpiry) driver.licenseExpiry = new Date(data.licenseExpiry);

    // Update vehicle info if provided
    if (data.vehicleInfo) {
      if (data.vehicleInfo.make) driver.vehicleInfo.make = data.vehicleInfo.make.trim();
      if (data.vehicleInfo.model) driver.vehicleInfo.model = data.vehicleInfo.model.trim();
      if (data.vehicleInfo.capacity) driver.vehicleInfo.capacity = data.vehicleInfo.capacity;
      if (data.vehicleInfo.color) driver.vehicleInfo.color = data.vehicleInfo.color.trim();
    }

    // Update bank details if provided
    if (data.bankDetails) {
      if (!driver.bankDetails) {
        driver.bankDetails = {};
      }
      if (data.bankDetails.accountName !== undefined) {
        driver.bankDetails.accountName = data.bankDetails.accountName ? data.bankDetails.accountName.trim() : null;
      }
      if (data.bankDetails.accountNumber !== undefined) {
        driver.bankDetails.accountNumber = data.bankDetails.accountNumber ? data.bankDetails.accountNumber.trim() : null;
      }
      if (data.bankDetails.bankName !== undefined) {
        driver.bankDetails.bankName = data.bankDetails.bankName ? data.bankDetails.bankName.trim() : null;
      }
      if (data.bankDetails.bankCode !== undefined) {
        driver.bankDetails.bankCode = data.bankDetails.bankCode ? data.bankDetails.bankCode.trim() : null;
      }
      driver.markModified('bankDetails');
    }

    const updatedDriver = await driver.save();
    if (!updatedDriver) {
      throw new CustomError("Failed to update profile", 500);
    }

    const driverData = updatedDriver.toObject();
    delete driverData.password;

    return driverData;
  }

  async changePassword(driver_id, oldPassword, newPassword) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!oldPassword) {
      throw new CustomError("Old password is required", 400);
    }
    if (!newPassword) {
      throw new CustomError("New password is required", 400);
    }

    const driver = await Driver.findOne({ driver_id }).select("+password");
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, driver.password);
    if (!isPasswordValid) {
      throw new CustomError("Old password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT);
    driver.password = hashedPassword;

    const updatedDriver = await driver.save();
    if (!updatedDriver) {
      throw new CustomError("Failed to change password", 500);
    }

    return { message: "Password changed successfully" };
  }

  async updateStatus(driver_id, status) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!status || !["active", "inactive", "on-break", "offline"].includes(status)) {
      throw new CustomError("Invalid status", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    driver.status = status;
    const updatedDriver = await driver.save();

    if (!updatedDriver) {
      throw new CustomError("Failed to update status", 500);
    }

    const driverData = updatedDriver.toObject();
    delete driverData.password;

    return driverData;
  }

  async getAssignedRoutes(driver_id) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const driver = await Driver.findOne({ driver_id }).populate("assignedRoutes.route_id");
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    return {
      driver_id: driver.driver_id,
      assignedRoutes: driver.assignedRoutes,
    };
  }

  async assignRoutes(driver_id, routeIds) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!routeIds || !Array.isArray(routeIds) || routeIds.length === 0) {
      throw new CustomError("Route IDs must be a non-empty array", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    driver.assignedRoutes = routeIds.map((route_id) => ({ route_id }));
    const updatedDriver = await driver.save();

    if (!updatedDriver) {
      throw new CustomError("Failed to assign routes", 500);
    }

    const driverData = updatedDriver.toObject();
    delete driverData.password;

    return driverData;
  }

  async updateRating(driver_id, newRating) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }
    if (!newRating || newRating < 1 || newRating > 5) {
      throw new CustomError("Rating must be between 1 and 5", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    // Update rating using average
    const currentRating = driver.rating;
    const currentCount = driver.ratingCount;
    const newCount = currentCount + 1;
    const averageRating = (currentRating * currentCount + newRating) / newCount;

    driver.rating = Math.round(averageRating * 10) / 10;
    driver.ratingCount = newCount;

    const updatedDriver = await driver.save();

    if (!updatedDriver) {
      throw new CustomError("Failed to update rating", 500);
    }

    return {
      driver_id: updatedDriver.driver_id,
      rating: updatedDriver.rating,
      ratingCount: updatedDriver.ratingCount,
    };
  }

  async suspendAccount(driver_id, reason = "") {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    driver.isSuspended = true;
    driver.status = "offline";
    const updatedDriver = await driver.save();

    if (!updatedDriver) {
      throw new CustomError("Failed to suspend account", 500);
    }

    return { message: "Account suspended successfully" };
  }

  async unsuspendAccount(driver_id) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const driver = await Driver.findOne({ driver_id });
    if (!driver) {
      throw new CustomError("Driver not found", 404);
    }

    driver.isSuspended = false;
    const updatedDriver = await driver.save();

    if (!updatedDriver) {
      throw new CustomError("Failed to unsuspend account", 500);
    }

    return { message: "Account unsuspended successfully" };
  }
}

module.exports = new DriverService();
