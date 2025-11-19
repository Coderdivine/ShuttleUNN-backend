const Support = require('../models/support.model');
const CustomError = require('../utils/custom-error');

class SupportService {
  /**
   * Submit feedback or support request
   */
  async submitFeedback(data) {
    try {
      const { user_id, userType, email, subject, message, category, attachments } = data;

      // Validation
      if (!user_id || !userType || !email || !subject || !message) {
        throw new CustomError('Missing required fields', 400);
      }

      if (!['student', 'driver', 'admin'].includes(userType)) {
        throw new CustomError('Invalid user type', 400);
      }

      if (!['technical', 'payment', 'booking', 'general', 'complaint'].includes(category)) {
        throw new CustomError('Invalid category', 400);
      }

      if (subject.length > 200) {
        throw new CustomError('Subject cannot exceed 200 characters', 400);
      }

      if (message.length < 10 || message.length > 5000) {
        throw new CustomError('Message must be between 10 and 5000 characters', 400);
      }

      const support = new Support({
        user_id,
        userType,
        email,
        subject,
        message,
        category,
        attachments: attachments || [],
        status: 'open',
      });

      const savedSupport = await support.save();
      return savedSupport;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get support request by ID
   */
  async getSupportRequest(supportId) {
    try {
      const support = await Support.findOne({ support_id: supportId });

      if (!support) {
        throw new CustomError('Support request not found', 404);
      }

      return support;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all support requests for a user
   */
  async getUserSupport(userId, limit = 20, skip = 0) {
    try {
      const supports = await Support.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Support.countDocuments({ user_id: userId });

      return {
        supports,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update support request status
   */
  async updateSupportStatus(supportId, status) {
    try {
      if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
        throw new CustomError('Invalid status', 400);
      }

      const support = await Support.findOneAndUpdate(
        { support_id: supportId },
        { status },
        { new: true, runValidators: true }
      );

      if (!support) {
        throw new CustomError('Support request not found', 404);
      }

      return support;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add response to support request
   */
  async respondToSupport(supportId, response_text, respondedBy) {
    try {
      if (!response_text || response_text.trim().length === 0) {
        throw new CustomError('Response text is required', 400);
      }

      const support = await Support.findOneAndUpdate(
        { support_id: supportId },
        {
          response: {
            text: response_text,
            respondedBy: respondedBy || 'admin',
            respondedAt: new Date(),
          },
          status: 'in-progress',
        },
        { new: true, runValidators: true }
      );

      if (!support) {
        throw new CustomError('Support request not found', 404);
      }

      return support;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all support requests by category with pagination
   */
  async getSupportByCategory(category, limit = 20, skip = 0) {
    try {
      if (!['technical', 'payment', 'booking', 'general', 'complaint'].includes(category)) {
        throw new CustomError('Invalid category', 400);
      }

      const supports = await Support.find({ category })
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Support.countDocuments({ category });

      return {
        supports,
        total,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get support statistics
   */
  async getSupportStats() {
    try {
      const total = await Support.countDocuments();
      const pending = await Support.countDocuments({ status: { $in: ['open', 'in-progress'] } });
      const resolved = await Support.countDocuments({ status: 'resolved' });
      const closed = await Support.countDocuments({ status: 'closed' });

      const byCategory = {};
      const categories = ['technical', 'payment', 'booking', 'general', 'complaint'];

      for (const category of categories) {
        byCategory[category] = await Support.countDocuments({ category });
      }

      return {
        total,
        pending,
        resolved,
        closed,
        byCategory,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Close resolved support request after 30 days
   */
  async autoCloseResolved() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await Support.updateMany(
        {
          status: 'resolved',
          'response.respondedAt': { $lt: thirtyDaysAgo },
        },
        { status: 'closed' }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get high priority open support requests
   */
  async getHighPrioritySupport() {
    try {
      const supports = await Support.find({
        status: { $in: ['open', 'in-progress'] },
        priority: { $in: ['high', 'urgent'] },
      }).sort({ priority: -1, createdAt: 1 });

      return supports;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete support request
   */
  async deleteSupport(supportId) {
    try {
      const support = await Support.findOneAndDelete({ support_id: supportId });

      if (!support) {
        throw new CustomError('Support request not found', 404);
      }

      return support;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SupportService();
