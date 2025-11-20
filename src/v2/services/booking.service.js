require("dotenv").config();
const Booking = require("../models/booking.model");
const Student = require("../models/student.model");
const Shuttle = require("../models/shuttle.model");
const Transaction = require("../models/transaction.model");
const CustomError = require("../utils/custom-error");
const { v4: uuidv4 } = require("uuid");

class BookingService {
  async createBooking(bookingData) {
    // Validation
    if (!bookingData.student_id) throw new CustomError("Student ID is required", 400);
    if (!bookingData.shuttle_id) throw new CustomError("Shuttle ID is required", 400);
    if (!bookingData.route_id) throw new CustomError("Route ID is required", 400);
    if (!bookingData.pickupStop) throw new CustomError("Pickup stop is required", 400);
    if (!bookingData.dropoffStop) throw new CustomError("Dropoff stop is required", 400);
    if (!bookingData.departureTime) throw new CustomError("Departure time is required", 400);
    if (!bookingData.fare) throw new CustomError("Fare is required", 400);

    // Check student exists and has sufficient balance
    const student = await Student.findOne({ student_id: bookingData.student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    if (student.walletBalance < bookingData.fare) {
      throw new CustomError("Insufficient wallet balance", 400);
    }

    // Check shuttle exists and has capacity
    const shuttle = await Shuttle.findOne({ shuttle_id: bookingData.shuttle_id });
    if (!shuttle) {
      throw new CustomError("Shuttle not found", 404);
    }

    if (shuttle.currentPassengers >= shuttle.capacity) {
      throw new CustomError("Shuttle is at full capacity", 400);
    }

    // Create booking
    const newBooking = new Booking({
      booking_id: uuidv4(),
      student_id: bookingData.student_id,
      shuttle_id: bookingData.shuttle_id,
      route_id: bookingData.route_id,
      pickupStop: {
        stop_id: bookingData.pickupStop.stop_id,
        stopName: bookingData.pickupStop.stopName,
        pickupTime: new Date(bookingData.pickupStop.pickupTime),
      },
      dropoffStop: {
        stop_id: bookingData.dropoffStop.stop_id,
        stopName: bookingData.dropoffStop.stopName,
        estimatedArrivalTime: new Date(bookingData.dropoffStop.estimatedArrivalTime),
      },
      bookingTime: new Date(),
      departureTime: new Date(bookingData.departureTime),
      fare: bookingData.fare,
      paymentMethod: bookingData.paymentMethod || "wallet",
      seatNumber: bookingData.seatNumber,
    });

    const savedBooking = await newBooking.save();
    if (!savedBooking) {
      throw new CustomError("Failed to create booking", 500);
    }

    return savedBooking;
  }

  async confirmBooking(booking_id, paymentMethod = "wallet") {
    if (!booking_id) {
      throw new CustomError("Booking ID is required", 400);
    }
    if (!["wallet", "card", "phone", "qrcode", "transfer"].includes(paymentMethod)) {
      throw new CustomError("Invalid payment method", 400);
    }

    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      throw new CustomError("Booking not found", 404);
    }

    if (booking.status !== "pending") {
      throw new CustomError("Only pending bookings can be confirmed", 400);
    }

    // Check student and wallet again
    const student = await Student.findOne({ student_id: booking.student_id });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    if (student.walletBalance < booking.fare) {
      throw new CustomError("Insufficient wallet balance", 400);
    }

    // Debit student wallet
    const previousBalance = student.walletBalance;
    const newBalance = previousBalance - booking.fare;
    student.walletBalance = newBalance;
    await student.save();

    // Create transaction record
    const transaction = new Transaction({
      transaction_id: uuidv4(),
      student_id: booking.student_id,
      amount: booking.fare,
      type: "debit",
      paymentMethod: paymentMethod,
      status: "completed",
      description: `Shuttle booking payment - Route ${booking.route_id}`,
      booking_id: booking.booking_id,
      previousBalance,
      newBalance,
    });
    await transaction.save();

    // Update booking status
    booking.status = "confirmed";
    booking.paymentStatus = "completed";
    booking.paymentMethod = paymentMethod;
    const updatedBooking = await booking.save();

    if (!updatedBooking) {
      throw new CustomError("Failed to confirm booking", 500);
    }

    // Increase shuttle current passengers
    const shuttle = await Shuttle.findOne({ shuttle_id: booking.shuttle_id });
    if (shuttle) {
      shuttle.currentPassengers += 1;
      await shuttle.save();
    }

    return updatedBooking;
  }

  async getBooking(booking_id) {
    if (!booking_id) {
      throw new CustomError("Booking ID is required", 400);
    }

    const booking = await Booking.findOne({ booking_id })
      .populate("student_id", "firstName lastName email")
      .populate("shuttle_id", "registrationNumber capacity")
      .populate("route_id", "routeName routeCode");

    if (!booking) {
      throw new CustomError("Booking not found", 404);
    }

    return booking;
  }

  async cancelBooking(booking_id, reason = "") {
    if (!booking_id) {
      throw new CustomError("Booking ID is required", 400);
    }

    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      throw new CustomError("Booking not found", 404);
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      throw new CustomError("Cannot cancel completed or already cancelled bookings", 400);
    }

    // If confirmed, refund wallet
    if (booking.status === "confirmed" || booking.paymentStatus === "completed") {
      const student = await Student.findOne({ student_id: booking.student_id });
      if (student) {
        const previousBalance = student.walletBalance;
        const newBalance = previousBalance + booking.fare;
        student.walletBalance = newBalance;
        await student.save();

        // Create refund transaction
        const transaction = new Transaction({
          transaction_id: uuidv4(),
          student_id: booking.student_id,
          amount: booking.fare,
          type: "refund",
          paymentMethod: booking.paymentMethod,
          status: "completed",
          description: `Booking cancellation refund - Booking ${booking.booking_id}`,
          booking_id: booking.booking_id,
          previousBalance,
          newBalance,
        });
        await transaction.save();
      }
    }

    // Decrease shuttle current passengers if confirmed
    if (booking.status === "confirmed" || booking.status === "active") {
      const shuttle = await Shuttle.findOne({ shuttle_id: booking.shuttle_id });
      if (shuttle && shuttle.currentPassengers > 0) {
        shuttle.currentPassengers -= 1;
        await shuttle.save();
      }
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancellationTime = new Date();

    const updatedBooking = await booking.save();

    if (!updatedBooking) {
      throw new CustomError("Failed to cancel booking", 500);
    }

    return updatedBooking;
  }

  async updateBookingStatus(booking_id, newStatus) {
    if (!booking_id) {
      throw new CustomError("Booking ID is required", 400);
    }
    if (!newStatus || !["pending", "confirmed", "active", "completed", "cancelled"].includes(newStatus)) {
      throw new CustomError("Invalid booking status", 400);
    }

    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      throw new CustomError("Booking not found", 404);
    }

    booking.status = newStatus;

    if (newStatus === "active") {
      booking.departureTime = new Date();
    }

    if (newStatus === "completed") {
      booking.arrivalTime = new Date();
    }

    const updatedBooking = await booking.save();

    if (!updatedBooking) {
      throw new CustomError("Failed to update booking status", 500);
    }

    return updatedBooking;
  }

  async rateBooking(booking_id, rating, feedback = "") {
    if (!booking_id) {
      throw new CustomError("Booking ID is required", 400);
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new CustomError("Rating must be between 1 and 5", 400);
    }

    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      throw new CustomError("Booking not found", 404);
    }

    if (booking.status !== "completed") {
      throw new CustomError("Only completed bookings can be rated", 400);
    }

    booking.rating = {
      score: rating,
      feedback: feedback,
      ratedAt: new Date(),
    };

    const updatedBooking = await booking.save();

    if (!updatedBooking) {
      throw new CustomError("Failed to rate booking", 500);
    }

    return updatedBooking;
  }

  async getStudentBookings(student_id, limit = 10, skip = 0) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const bookings = await Booking.find({ student_id })
      .sort({ bookingTime: -1 })
      .limit(limit)
      .skip(skip)
      .populate("shuttle_id", "registrationNumber make model")
      .populate("route_id", "routeName routeCode");

    const total = await Booking.countDocuments({ student_id });

    return {
      bookings,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getStudentTrips(student_id, status = null, limit = 10, skip = 0) {
    if (!student_id) {
      throw new CustomError("Student ID is required", 400);
    }

    const query = { student_id };
    if (status) {
      query.status = status;
    }

    const trips = await Booking.find(query)
      .sort({ departureTime: -1 })
      .limit(limit)
      .skip(skip)
      .populate("shuttle_id", "registrationNumber make model")
      .populate("route_id", "routeName routeCode");

    const total = await Booking.countDocuments(query);

    return {
      trips,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getShuttleBookings(shuttle_id, limit = 20, skip = 0) {
    if (!shuttle_id) {
      throw new CustomError("Shuttle ID is required", 400);
    }

    const bookings = await Booking.find({ shuttle_id })
      .sort({ departureTime: -1 })
      .limit(limit)
      .skip(skip)
      .populate("student_id", "firstName lastName phone")
      .populate("route_id", "routeName routeCode");

    const total = await Booking.countDocuments({ shuttle_id });

    return {
      bookings,
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    };
  }

  async getDriverBookings(driver_id, limit = 20, skip = 0) {
    if (!driver_id) {
      throw new CustomError("Driver ID is required", 400);
    }

    try {
      console.log("=== getDriverBookings START ===");
      console.log("Driver ID:", driver_id);

      // Get driver's assigned shuttle
      const Shuttle = require("../models/shuttle.model");
      const shuttle = await Shuttle.findOne({ assignedDriver: driver_id });
      console.log("Found shuttle:", shuttle ? shuttle.shuttle_id : "None");

      // Build query to get ALL bookings for this driver
      const bookingQueries = [];

      // Add shuttle bookings query if driver has an assigned shuttle
      if (shuttle) {
        bookingQueries.push({ shuttle_id: shuttle.shuttle_id });
      }

      // ALWAYS include QR payment bookings for this driver
      bookingQueries.push({ 
        shuttle_id: `QR-${driver_id}`,
        paymentMethod: "qrcode"
      });

      console.log("Booking queries:", JSON.stringify(bookingQueries, null, 2));

      // Fetch all bookings using $or query - NO POPULATE
      const allBookings = await Booking.find({ 
        $or: bookingQueries 
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      console.log("Found bookings:", allBookings.length);

      if (allBookings.length === 0) {
        console.log("=== getDriverBookings END (no bookings) ===");
        return {
          bookings: [],
          total: 0,
          limit,
          skip,
          hasMore: false,
        };
      }

      // Manually populate to avoid CastError
      const Student = require("../models/student.model");
      const Route = require("../models/route.model");

      // Populate student and route data
      for (let booking of allBookings) {
        if (booking.student_id) {
          try {
            const student = await Student.findOne({ student_id: booking.student_id })
              .select("firstName lastName phone email")
              .lean();
            if (student) {
              booking.student_id = student;
            }
          } catch (err) {
            console.warn(`Failed to populate student for booking ${booking.booking_id}:`, err.message);
          }
        }

        if (booking.route_id) {
          try {
            const route = await Route.findOne({ route_id: booking.route_id })
              .select("routeName routeCode")
              .lean();
            if (route) {
              booking.route_id = route;
            }
          } catch (err) {
            console.warn(`Failed to populate route for booking ${booking.booking_id}:`, err.message);
          }
        }
      }

      // Apply pagination
      const total = allBookings.length;
      const paginatedBookings = allBookings.slice(skip, skip + limit);

      console.log("=== getDriverBookings END ===");
      return {
        bookings: paginatedBookings,
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      console.error("=== getDriverBookings ERROR ===");
      console.error("Error details:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      throw error;
    }
  }
}

module.exports = new BookingService();

