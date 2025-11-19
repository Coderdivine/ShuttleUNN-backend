const express = require("express");
const router = express.Router();
const RouteController = require("../controllers/route.controller");

// Route CRUD operations
router.get("/", RouteController.getAllRoutes);
router.post("/", RouteController.createRoute);

// Search functionality (must come before :route_id routes)
router.get("/search/query", RouteController.searchRoutes);
router.get("/search/by-stop", RouteController.getRoutesByStop);

// Route-specific operations (after search to avoid conflicts)
router.get("/:route_id", RouteController.getRouteById);
router.put("/:route_id", RouteController.updateRoute);
router.delete("/:route_id", RouteController.deleteRoute);

// Stop management
router.get("/:route_id/stops", RouteController.getRouteStops);
router.post("/:route_id/stops", RouteController.addStop);
router.delete("/:route_id/stops/:stop_id", RouteController.removeStop);

module.exports = router;
