const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/booking.controller");

// Student bookings and trips (must come before :booking_id routes to avoid conflicts)
router.get("/student/:student_id/bookings", BookingController.getStudentBookings);
router.get("/student/:student_id/trips", BookingController.getStudentTrips);

// Shuttle bookings (must come before :booking_id routes)
router.get("/shuttle/:shuttle_id/bookings", BookingController.getShuttleBookings);

// Driver bookings (must come before :booking_id routes)
router.get("/driver/:driver_id/bookings", BookingController.getDriverBookings);

// Booking creation and retrieval
router.post("/", BookingController.createBooking);
router.get("/:booking_id", BookingController.getBooking);

// Booking status management
router.post("/:booking_id/confirm", BookingController.confirmBooking);
router.post("/:booking_id/cancel", BookingController.cancelBooking);
router.put("/:booking_id/status", BookingController.updateBookingStatus);

// Booking rating
router.post("/:booking_id/rate", BookingController.rateBooking);

module.exports = router;
