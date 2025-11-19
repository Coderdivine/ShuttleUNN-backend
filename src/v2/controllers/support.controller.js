const supportService = require('../services/support.service');

class SupportController {
  /**
   * Submit feedback or support request
   * POST /v2/support/submit
   */
  async submitFeedback(req, res, next) {
    try {
      const { user_id, userType, email, subject, message, category, attachments } = req.body;

      const support = await supportService.submitFeedback({
        user_id,
        userType,
        email,
        subject,
        message,
        category: category || 'general',
        attachments,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Support request submitted successfully',
        support,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get support request by ID
   * GET /v2/support/:support_id
   */
  async getSupportRequest(req, res, next) {
    try {
      const { support_id } = req.params;

      const support = await supportService.getSupportRequest(support_id);

      return res.status(200).json({
        status: 'success',
        support,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all support requests for a user
   * GET /v2/support/user/:user_id
   */
  async getUserSupport(req, res, next) {
    try {
      const { user_id } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      const data = await supportService.getUserSupport(user_id, parseInt(limit), parseInt(skip));

      return res.status(200).json({
        status: 'success',
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update support request status
   * PUT /v2/support/:support_id/status
   */
  async updateSupportStatus(req, res, next) {
    try {
      const { support_id } = req.params;
      const { status } = req.body;

      const support = await supportService.updateSupportStatus(support_id, status);

      return res.status(200).json({
        status: 'success',
        message: 'Support request status updated',
        support,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add response to support request
   * PUT /v2/support/:support_id/respond
   */
  async respondToSupport(req, res, next) {
    try {
      const { support_id } = req.params;
      const { response } = req.body;

      const support = await supportService.respondToSupport(support_id, response);

      return res.status(200).json({
        status: 'success',
        message: 'Response added to support request',
        support,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get support requests by category
   * GET /v2/support/category/:category
   */
  async getSupportByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      const data = await supportService.getSupportByCategory(category, parseInt(limit), parseInt(skip));

      return res.status(200).json({
        status: 'success',
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get support statistics
   * GET /v2/support/stats
   */
  async getSupportStats(req, res, next) {
    try {
      const stats = await supportService.getSupportStats();

      return res.status(200).json({
        status: 'success',
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get high priority support requests
   * GET /v2/support/priority/high
   */
  async getHighPrioritySupport(req, res, next) {
    try {
      const supports = await supportService.getHighPrioritySupport();

      return res.status(200).json({
        status: 'success',
        count: supports.length,
        supports,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete support request
   * DELETE /v2/support/:support_id
   */
  async deleteSupport(req, res, next) {
    try {
      const { support_id } = req.params;

      await supportService.deleteSupport(support_id);

      return res.status(200).json({
        status: 'success',
        message: 'Support request deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupportController();
