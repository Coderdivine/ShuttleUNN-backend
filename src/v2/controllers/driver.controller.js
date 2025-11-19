const DriverService = require("../services/driver.service");
const response = require("../utils/response");

class DriverController {
  async register(req, res, next) {
    try {
      const driver = await DriverService.register(req.body);
      return res.status(201).send(response("Driver registered successfully", driver));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const driver = await DriverService.login(req.body);
      return res.status(200).send(response("Login successful", driver));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { driver_id } = req.params;
      const driver = await DriverService.getProfile(driver_id);
      return res.status(200).send(response("Profile retrieved successfully", driver));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { driver_id } = req.params;
      const updatedDriver = await DriverService.updateProfile(driver_id, req.body);
      return res.status(200).send(response("Profile updated successfully", updatedDriver));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const result = await DriverService.changePassword(driver_id, oldPassword, newPassword);
      return res.status(200).send(response("Password changed successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { status } = req.body;
      const updatedDriver = await DriverService.updateStatus(driver_id, status);
      return res.status(200).send(response("Status updated successfully", updatedDriver));
    } catch (error) {
      next(error);
    }
  }

  async getAssignedRoutes(req, res, next) {
    try {
      const { driver_id } = req.params;
      const routes = await DriverService.getAssignedRoutes(driver_id);
      return res.status(200).send(response("Assigned routes retrieved successfully", routes));
    } catch (error) {
      next(error);
    }
  }

  async assignRoutes(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { routeIds } = req.body;
      const updatedDriver = await DriverService.assignRoutes(driver_id, routeIds);
      return res.status(200).send(response("Routes assigned successfully", updatedDriver));
    } catch (error) {
      next(error);
    }
  }

  async updateRating(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { rating } = req.body;
      const result = await DriverService.updateRating(driver_id, rating);
      return res.status(200).send(response("Rating updated successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async suspendAccount(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { reason } = req.body;
      const result = await DriverService.suspendAccount(driver_id, reason);
      return res.status(200).send(response("Account suspended successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async unsuspendAccount(req, res, next) {
    try {
      const { driver_id } = req.params;
      const result = await DriverService.unsuspendAccount(driver_id);
      return res.status(200).send(response("Account unsuspended successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();
