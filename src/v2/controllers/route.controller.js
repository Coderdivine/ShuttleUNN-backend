const RouteService = require("../services/route.service");
const Response = require("../utils/response");

class RouteController {
  async getAllRoutes(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const result = await RouteService.getAllRoutes(parseInt(limit), parseInt(skip));
      return Response.success(res, result, "Routes retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getRouteById(req, res, next) {
    try {
      const { route_id } = req.params;
      const route = await RouteService.getRouteById(route_id);
      return Response.success(res, route, "Route retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async createRoute(req, res, next) {
    try {
      const route = await RouteService.createRoute(req.body);
      return Response.success(res, route, "Route created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateRoute(req, res, next) {
    try {
      const { route_id } = req.params;
      const updatedRoute = await RouteService.updateRoute(route_id, req.body);
      return Response.success(res, updatedRoute, "Route updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteRoute(req, res, next) {
    try {
      const { route_id } = req.params;
      const result = await RouteService.deleteRoute(route_id);
      return Response.success(res, result, "Route deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getRouteStops(req, res, next) {
    try {
      const { route_id } = req.params;
      const result = await RouteService.getRouteStops(route_id);
      return Response.success(res, result, "Route stops retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async addStop(req, res, next) {
    try {
      const { route_id } = req.params;
      const updatedRoute = await RouteService.addStop(route_id, req.body);
      return Response.success(res, updatedRoute, "Stop added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeStop(req, res, next) {
    try {
      const { route_id, stop_id } = req.params;
      const updatedRoute = await RouteService.removeStop(route_id, stop_id);
      return Response.success(res, updatedRoute, "Stop removed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async searchRoutes(req, res, next) {
    try {
      const { query, limit = 10, skip = 0 } = req.query;
      const result = await RouteService.searchRoutes(query, parseInt(limit), parseInt(skip));
      return Response.success(res, result, "Routes searched successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getRoutesByStop(req, res, next) {
    try {
      const { stopName } = req.query;
      const { limit = 10, skip = 0 } = req.query;
      const result = await RouteService.getRoutesByStop(stopName, parseInt(limit), parseInt(skip));
      return Response.success(res, result, "Routes retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RouteController();
