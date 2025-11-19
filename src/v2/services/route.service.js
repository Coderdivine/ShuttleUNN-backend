require("dotenv").config();
const Route = require("../models/route.model");
const CustomError = require("../utils/custom-error");
const { v4: uuidv4 } = require("uuid");

class RouteService {
  async getAllRoutes(limit = 20, skip = 0) {
    const routes = await Route.find({ status: "active" })
      .sort({ routeName: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Route.countDocuments({ status: "active" });

    return {
      routes,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getRouteById(route_id) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    return route;
  }

  async createRoute(routeData) {
    // Validation
    if (!routeData.routeName) throw new CustomError("Route name is required", 400);
    if (!routeData.routeCode) throw new CustomError("Route code is required", 400);
    if (!routeData.stops || !Array.isArray(routeData.stops) || routeData.stops.length < 2) {
      throw new CustomError("At least 2 stops are required", 400);
    }
    if (!routeData.distance) throw new CustomError("Distance is required", 400);
    if (!routeData.estimatedDuration) throw new CustomError("Estimated duration is required", 400);
    if (!routeData.operatingHours) throw new CustomError("Operating hours are required", 400);
    if (!routeData.fare) throw new CustomError("Fare is required", 400);

    // Check if route code already exists
    const existingRoute = await Route.findOne({ routeCode: routeData.routeCode.toUpperCase() });
    if (existingRoute) {
      throw new CustomError("Route code already exists", 400);
    }

    // Format stops with UUIDs
    const formattedStops = routeData.stops.map((stop, index) => ({
      stop_id: stop.stop_id || uuidv4(),
      stopName: stop.stopName?.trim(),
      latitude: stop.latitude,
      longitude: stop.longitude,
      order: index,
    }));

    // Create new route
    const newRoute = new Route({
      route_id: uuidv4(),
      routeName: routeData.routeName.trim(),
      routeCode: routeData.routeCode.toUpperCase().trim(),
      description: routeData.description?.trim(),
      stops: formattedStops,
      distance: routeData.distance,
      estimatedDuration: routeData.estimatedDuration,
      operatingHours: {
        startTime: routeData.operatingHours.startTime,
        endTime: routeData.operatingHours.endTime,
      },
      fare: routeData.fare,
      status: "active",
    });

    const savedRoute = await newRoute.save();

    if (!savedRoute) {
      throw new CustomError("Failed to create route", 500);
    }

    return savedRoute;
  }

  async updateRoute(route_id, updateData) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    // Check if route code is being updated and if it's unique
    if (updateData.routeCode && updateData.routeCode !== route.routeCode) {
      const existingRoute = await Route.findOne({
        routeCode: updateData.routeCode.toUpperCase(),
      });
      if (existingRoute) {
        throw new CustomError("Route code already exists", 400);
      }
      route.routeCode = updateData.routeCode.toUpperCase().trim();
    }

    // Update allowed fields
    if (updateData.routeName) route.routeName = updateData.routeName.trim();
    if (updateData.description) route.description = updateData.description.trim();
    if (updateData.distance) route.distance = updateData.distance;
    if (updateData.estimatedDuration) route.estimatedDuration = updateData.estimatedDuration;
    if (updateData.fare) route.fare = updateData.fare;
    if (updateData.status && ["active", "inactive"].includes(updateData.status)) {
      route.status = updateData.status;
    }

    // Update operating hours if provided
    if (updateData.operatingHours) {
      if (updateData.operatingHours.startTime) {
        route.operatingHours.startTime = updateData.operatingHours.startTime;
      }
      if (updateData.operatingHours.endTime) {
        route.operatingHours.endTime = updateData.operatingHours.endTime;
      }
    }

    // Update stops if provided
    if (updateData.stops && Array.isArray(updateData.stops)) {
      const formattedStops = updateData.stops.map((stop, index) => ({
        stop_id: stop.stop_id || uuidv4(),
        stopName: stop.stopName?.trim(),
        latitude: stop.latitude,
        longitude: stop.longitude,
        order: index,
      }));
      route.stops = formattedStops;
    }

    const updatedRoute = await route.save();

    if (!updatedRoute) {
      throw new CustomError("Failed to update route", 500);
    }

    return updatedRoute;
  }

  async deleteRoute(route_id) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    // Set status to inactive instead of deleting
    route.status = "inactive";
    const result = await route.save();

    if (!result) {
      throw new CustomError("Failed to delete route", 500);
    }

    return { message: "Route deleted successfully" };
  }

  async getRouteStops(route_id) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    return {
      route_id: route.route_id,
      routeName: route.routeName,
      routeCode: route.routeCode,
      stops: route.stops,
    };
  }

  async addStop(route_id, stopData) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }
    if (!stopData.stopName) {
      throw new CustomError("Stop name is required", 400);
    }
    if (typeof stopData.latitude !== "number" || typeof stopData.longitude !== "number") {
      throw new CustomError("Latitude and longitude are required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    const newStop = {
      stop_id: uuidv4(),
      stopName: stopData.stopName.trim(),
      latitude: stopData.latitude,
      longitude: stopData.longitude,
      order: route.stops.length,
    };

    route.stops.push(newStop);
    const updatedRoute = await route.save();

    if (!updatedRoute) {
      throw new CustomError("Failed to add stop", 500);
    }

    return updatedRoute;
  }

  async removeStop(route_id, stop_id) {
    if (!route_id) {
      throw new CustomError("Route ID is required", 400);
    }
    if (!stop_id) {
      throw new CustomError("Stop ID is required", 400);
    }

    const route = await Route.findOne({ route_id });

    if (!route) {
      throw new CustomError("Route not found", 404);
    }

    const initialLength = route.stops.length;
    route.stops = route.stops.filter((stop) => stop.stop_id !== stop_id);

    if (route.stops.length === initialLength) {
      throw new CustomError("Stop not found", 404);
    }

    if (route.stops.length < 2) {
      throw new CustomError("Route must have at least 2 stops", 400);
    }

    // Reorder stops
    route.stops.forEach((stop, index) => {
      stop.order = index;
    });

    const updatedRoute = await route.save();

    if (!updatedRoute) {
      throw new CustomError("Failed to remove stop", 500);
    }

    return updatedRoute;
  }

  async searchRoutes(query, limit = 10, skip = 0) {
    if (!query) {
      throw new CustomError("Search query is required", 400);
    }

    const searchRegex = new RegExp(query, "i");

    const routes = await Route.find({
      status: "active",
      $or: [
        { routeName: searchRegex },
        { routeCode: searchRegex },
        { description: searchRegex },
        { "stops.stopName": searchRegex },
      ],
    })
      .limit(limit)
      .skip(skip);

    const total = await Route.countDocuments({
      status: "active",
      $or: [
        { routeName: searchRegex },
        { routeCode: searchRegex },
        { description: searchRegex },
        { "stops.stopName": searchRegex },
      ],
    });

    return {
      routes,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getRoutesByStop(stopName, limit = 10, skip = 0) {
    if (!stopName) {
      throw new CustomError("Stop name is required", 400);
    }

    const searchRegex = new RegExp(stopName, "i");

    const routes = await Route.find({
      status: "active",
      "stops.stopName": searchRegex,
    })
      .limit(limit)
      .skip(skip);

    const total = await Route.countDocuments({
      status: "active",
      "stops.stopName": searchRegex,
    });

    return {
      routes,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }
}

module.exports = new RouteService();
