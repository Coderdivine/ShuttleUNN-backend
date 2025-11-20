const BookingService = require("../services/booking.service");
const response = require("../utils/response");

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await BookingService.createBooking(req.body);
      return Response.success(res, booking, "Booking created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const { booking_id } = req.params;
      const { paymentMethod } = req.body;
      const booking = await BookingService.confirmBooking(booking_id, paymentMethod);
      return Response.success(res, booking, "Booking confirmed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getBooking(req, res, next) {
    try {
      const { booking_id } = req.params;
      const booking = await BookingService.getBooking(booking_id);
      return Response.success(res, booking, "Booking retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { booking_id } = req.params;
      const { reason } = req.body;
      const booking = await BookingService.cancelBooking(booking_id, reason);
      return Response.success(res, booking, "Booking cancelled successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { booking_id } = req.params;
      const { status } = req.body;
      const booking = await BookingService.updateBookingStatus(booking_id, status);
      return Response.success(res, booking, "Booking status updated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async rateBooking(req, res, next) {
    try {
      const { booking_id } = req.params;
      const { rating, feedback } = req.body;
      const booking = await BookingService.rateBooking(booking_id, rating, feedback);
      return Response.success(res, booking, "Booking rated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getStudentBookings(req, res, next) {
    try {
      const { student_id } = req.params;
      const { limit = 10, skip = 0 } = req.query;
      const result = await BookingService.getStudentBookings(student_id, parseInt(limit), parseInt(skip));
      return Response.success(res, result, "Student bookings retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getStudentTrips(req, res, next) {
    try {
      const { student_id } = req.params;
      const { status = null, limit = 10, skip = 0 } = req.query;
      const result = await BookingService.getStudentTrips(student_id, status, parseInt(limit), parseInt(skip));
      return Response.success(res, result, "Student trips retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getShuttleBookings(req, res, next) {
    try {
      const { shuttle_id } = req.params;
      const { limit = 20, skip = 0 } = req.query;
      const result = await BookingService.getShuttleBookings(shuttle_id, parseInt(limit), parseInt(skip));
      return res.status(200).send(response("Shuttle bookings retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }

  async getDriverBookings(req, res, next) {
    try {
      const { driver_id } = req.params;
      const { limit = 20, skip = 0 } = req.query;
      const result = await BookingService.getDriverBookings(driver_id, parseInt(limit), parseInt(skip));
      return res.status(200).send(response("Driver bookings retrieved successfully", result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
