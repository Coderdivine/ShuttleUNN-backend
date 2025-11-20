const ShuttleService = require("../services/shuttle.service");
const response = require("../utils/response");

class ShuttleController {
  async getAllShuttles(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const result = await ShuttleService.getAllShuttles(parseInt(limit), parseInt(skip));
      return res.status(200).send(response("Shuttles retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async getAvailableShuttles(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const result = await ShuttleService.getAvailableShuttles(parseInt(limit), parseInt(skip));
      return res.status(200).send(response("Available shuttles retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async getShuttleDetails(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const shuttle = await ShuttleService.getShuttleDetails(shuttle_id);
      return res.status(200).send(response("Shuttle details retrieved successfully", shuttle));
    } catch (error) {
      next(error);
    }
  }

  async createShuttle(req, res, next) {
    try {
      const shuttle = await ShuttleService.createShuttle(req.body);
      return Response.success(res, shuttle, "Shuttle created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateShuttle(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const updatedShuttle = await ShuttleService.updateShuttle(shuttle_id, req.body);
      return Response.success(res, updatedShuttle, "Shuttle updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { latitude, longitude } = req.body;
      const result = await ShuttleService.updateLocation(shuttle_id, latitude, longitude);
      return Response.success(res, result, "Location updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async assignDriver(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { driver_id } = req.body;
      const updatedShuttle = await ShuttleService.assignDriver(shuttle_id, driver_id);
      return Response.success(res, updatedShuttle, "Driver assigned successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async assignRoutes(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { routeIds } = req.body;
      const updatedShuttle = await ShuttleService.assignRoutes(shuttle_id, routeIds);
      return Response.success(res, updatedShuttle, "Routes assigned successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateCapacity(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { capacity } = req.body;
      const updatedShuttle = await ShuttleService.updateCapacity(shuttle_id, capacity);
      return Response.success(res, updatedShuttle, "Capacity updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async updatePassengerCount(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { action } = req.body;
      const result = await ShuttleService.updatePassengerCount(shuttle_id, action);
      return Response.success(res, result, "Passenger count updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async addMaintenance(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const updatedShuttle = await ShuttleService.addMaintenance(shuttle_id, req.body);
      return Response.success(res, updatedShuttle, "Maintenance added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async completeMaintenance(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { maintenanceIndex } = req.body;
      const updatedShuttle = await ShuttleService.completeMaintenance(shuttle_id, maintenanceIndex);
      return Response.success(res, updatedShuttle, "Maintenance completed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async setCurrentRoute(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { route_id } = req.body;
      const updatedShuttle = await ShuttleService.setCurrentRoute(shuttle_id, route_id);
      return Response.success(res, updatedShuttle, "Current route set successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateDistance(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { distanceInKm } = req.body;
      const result = await ShuttleService.updateDistance(shuttle_id, distanceInKm);
      return Response.success(res, result, "Distance updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async incrementTrips(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const result = await ShuttleService.incrementTrips(shuttle_id);
      return Response.success(res, result, "Trips incremented successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async deactivateShuttle(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const result = await ShuttleService.deactivateShuttle(shuttle_id);
      return Response.success(res, result, "Shuttle deactivated successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShuttleController();
