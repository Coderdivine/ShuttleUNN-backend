const AdminService = require("../services/admin.service");

class AdminController {
  static async searchStudent(req, res) {
    try {
      const { email, regNumber } = req.query;
      const student = await AdminService.findStudent(email, regNumber);
      res.status(200).json(student);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = AdminController;
