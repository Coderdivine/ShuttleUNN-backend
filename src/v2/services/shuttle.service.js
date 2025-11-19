require("dotenv").config();
const Shuttle = require("../models/shuttle.model");
const CustomError = require("../utils/custom-error");
const { v4: uuidv4 } = require("uuid");

class ShuttleService {
  async getAllShuttles(limit = 20, skip = 0) {
    const shuttles = await Shuttle.find({ isActive: true })
      .sort({ registrationNumber: 1 })
      .limit(limit)
      .skip(skip)
      .populate("assignedDriver", "firstName lastName phone status");

    const total = await Shuttle.countDocuments({ isActive: true });

    return {
      shuttles,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getAvailableShuttles(limit = 20, skip = 0) {
    const shuttles = await Shuttle.find({
      isActive: true,
      status: "available",
    })
      .limit(limit)
      .skip(skip)
      .populate("assignedDriver", "firstName lastName phone status");

    const total = await Shuttle.countDocuments({
      isActive: true,
      status: "available",
    });

    return {
      shuttles,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getShuttleDetails(shuttle_id) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id })
      .populate("assignedDriver", "firstName lastName phone licenseNumber status")
      .populate("assignedRoutes.route_id", "routeName routeCode");

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    return shuttle;
  }

  async createShuttle(shuttleData) {
    // Validation
    if (!shuttleData.registrationNumber) throw new CustomError("Registration number is required", 400);
    if (!shuttleData.make) throw new CustomError("Make is required", 400);
    if (!shuttleData.model) throw new CustomError("Model is required", 400);
    if (!shuttleData.capacity) throw new CustomError("Capacity is required", 400);

    // Check if registration number already exists
    const existingShuttle = await Shuttle.findOne({
      registrationNumber: shuttleData.registrationNumber.toUpperCase(),
    });
    if (existingShuttle) {
      throw new CustomError("Registration number already registered", 400);
    }

    // Create new shuttle
    const newShuttle = new Shuttle({
      shuttle_id: uuidv4(),
      registrationNumber: shuttleData.registrationNumber.toUpperCase().trim(),
      make: shuttleData.make.trim(),
      model: shuttleData.model.trim(),
      capacity: shuttleData.capacity,
      color: shuttleData.color?.trim(),
      currentPassengers: 0,
      status: "available",
      isActive: true,
    });

    const savedShuttle = await newShuttle.save();

    if (!savedShuttle) {
      throw new CustomError("Failed to create shuttle", 500);
    }

    return savedShuttle;
  }

  async updateShuttle(shuttle_id, updateData) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    // Check if registration number is being updated and if it's unique
    if (updateData.registrationNumber && updateData.registrationNumber !== shuttle.registrationNumber) {
      const existingShuttle = await Shuttle.findOne({
        registrationNumber: updateData.registrationNumber.toUpperCase(),
      });
      if (existingShuttle) {
        throw new CustomError("Registration number already registered", 400);
      }
      shuttle.registrationNumber = updateData.registrationNumber.toUpperCase().trim();
    }

    // Update allowed fields
    if (updateData.make) shuttle.make = updateData.make.trim();
    if (updateData.model) shuttle.model = updateData.model.trim();
    if (updateData.capacity) shuttle.capacity = updateData.capacity;
    if (updateData.color) shuttle.color = updateData.color.trim();
    if (updateData.status && ["available", "in-transit", "maintenance", "offline"].includes(updateData.status)) {
      shuttle.status = updateData.status;
    }

    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to update shuttle", 500);
    }

    return updatedShuttle;
  }

  async updateLocation(shuttle_id, latitude, longitude) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new CustomError("Valid latitude and longitude are required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.currentLocation = {
      latitude,
      longitude,
      lastUpdated: new Date(),
    };

    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to update location", 500);
    }

    return {
      shuttle_id: updatedShuttle.shuttle_id,
      currentLocation: updatedShuttle.currentLocation,
    };
  }

  async assignDriver(shuttle_id, driver_id) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.assignedDriver = driver_id;
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to assign driver", 500);
    }

    return updatedShuttle;
  }

  async assignRoutes(shuttle_id, routeIds) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!routeIds || !Array.isArray(routeIds) || routeIds.length === 0) {
      throw new CustomError("Route IDs must be a non-empty array", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.assignedRoutes = routeIds.map((route_id) => ({ route_id }));
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to assign routes", 500);
    }

    return updatedShuttle;
  }

  async updateCapacity(shuttle_id, capacity) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!capacity || typeof capacity !== "number" || capacity < 1) {
      throw new CustomError("Valid capacity is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    if (shuttle.currentPassengers > capacity) {
      throw new CustomError("Cannot reduce capacity below current passenger count", 400);
    }

    shuttle.capacity = capacity;
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to update capacity", 500);
    }

    return updatedShuttle;
  }

  async updatePassengerCount(shuttle_id, action = "increment") {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!["increment", "decrement"].includes(action)) {
      throw new CustomError("Invalid action", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    if (action === "increment") {
      if (shuttle.currentPassengers >= shuttle.capacity) {
        throw new CustomError("Shuttle is at full capacity", 400);
      }
      shuttle.currentPassengers += 1;
    } else {
      if (shuttle.currentPassengers <= 0) {
        throw new CustomError("Cannot decrement below 0 passengers", 400);
      }
      shuttle.currentPassengers -= 1;
    }

    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to update passenger count", 500);
    }

    return {
      shuttle_id: updatedShuttle.shuttle_id,
      currentPassengers: updatedShuttle.currentPassengers,
      capacity: updatedShuttle.capacity,
    };
  }

  async addMaintenance(shuttle_id, maintenanceData) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!maintenanceData.type) {
      throw new CustomError("Maintenance type is required", 400);
    }
    if (!maintenanceData.scheduledDate) {
      throw new CustomError("Scheduled date is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    const maintenance = {
      type: maintenanceData.type,
      scheduledDate: new Date(maintenanceData.scheduledDate),
      description: maintenanceData.description?.trim(),
      status: "scheduled",
    };

    shuttle.maintenanceSchedule.push(maintenance);
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to add maintenance", 500);
    }

    return updatedShuttle;
  }

  async completeMaintenance(shuttle_id, maintenanceIndex) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (typeof maintenanceIndex !== "number" || maintenanceIndex < 0) {
      throw new CustomError("Valid maintenance index is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    if (!shuttle.maintenanceSchedule[maintenanceIndex]) {
      throw new CustomError("Maintenance record not found", 404);
    }

    shuttle.maintenanceSchedule[maintenanceIndex].status = "completed";
    shuttle.maintenanceSchedule[maintenanceIndex].completedDate = new Date();

    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to complete maintenance", 500);
    }

    return updatedShuttle;
  }

  async setCurrentRoute(shuttle_id, route_id) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.currentRoute = route_id;
    shuttle.status = "in-transit";

    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to set current route", 500);
    }

    return updatedShuttle;
  }

  async updateDistance(shuttle_id, distanceInKm) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }
    if (typeof distanceInKm !== "number" || distanceInKm < 0) {
      throw new CustomError("Valid distance is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.totalDistance += distanceInKm;
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to update distance", 500);
    }

    return {
      shuttle_id: updatedShuttle.shuttle_id,
      totalDistance: updatedShuttle.totalDistance,
    };
  }

  async incrementTrips(shuttle_id) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.totalTrips += 1;
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to increment trips", 500);
    }

    return {
      shuttle_id: updatedShuttle.shuttle_id,
      totalTrips: updatedShuttle.totalTrips,
    };
  }

  async deactivateShuttle(shuttle_id) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }

    const shuttle = await Shuttle.findOne({ shuttle_id });

    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    shuttle.isActive = false;
    shuttle.status = "offline";
    const updatedShuttle = await shuttle.save();

    if (!updatedShuttle) {
      throw new CustomError("Failed to deactivate shuttle", 500);
    }

    return { message: "Shuttle deactivated successfully" };
  }
}

module.exports = new ShuttleService();
