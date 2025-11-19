const express = require("express");
const router = express.Router();
const ShuttleController = require("../controllers/shuttle.controller");

// Shuttle retrieval
router.get("/", ShuttleController.getAllShuttles);
router.post("/", ShuttleController.createShuttle);

// Special routes (before :shuttle_id to avoid conflicts)
router.get("/available", ShuttleController.getAvailableShuttles);

// Shuttle-specific operations
router.get("/:shuttle_id", ShuttleController.getShuttleDetails);
router.put("/:shuttle_id", ShuttleController.updateShuttle);
router.post("/:shuttle_id/deactivate", ShuttleController.deactivateShuttle);

// Location tracking
router.put("/:shuttle_id/location", ShuttleController.updateLocation);

// Driver assignment
router.post("/:shuttle_id/driver", ShuttleController.assignDriver);

// Route assignment
router.post("/:shuttle_id/routes", ShuttleController.assignRoutes);
router.post("/:shuttle_id/current-route", ShuttleController.setCurrentRoute);

// Capacity management
router.put("/:shuttle_id/capacity", ShuttleController.updateCapacity);
router.put("/:shuttle_id/passengers", ShuttleController.updatePassengerCount);

// Maintenance
router.post("/:shuttle_id/maintenance", ShuttleController.addMaintenance);
router.put("/:shuttle_id/maintenance/complete", ShuttleController.completeMaintenance);

// Trip and distance tracking
router.put("/:shuttle_id/distance", ShuttleController.updateDistance);
router.post("/:shuttle_id/trips/increment", ShuttleController.incrementTrips);

module.exports = router;
