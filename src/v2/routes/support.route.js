const express = require('express');
const supportController = require('../controllers/support.controller');

const router = express.Router();

/**
 * POST /v2/support/submit - Submit feedback or support request
 */
router.post('/submit', supportController.submitFeedback);

/**
 * GET /v2/support/stats - Get support statistics
 */
router.get('/stats', supportController.getSupportStats);

/**
 * GET /v2/support/priority/high - Get high priority support requests
 */
router.get('/priority/high', supportController.getHighPrioritySupport);

/**
 * GET /v2/support/category/:category - Get support requests by category
 */
router.get('/category/:category', supportController.getSupportByCategory);

/**
 * GET /v2/support/user/:user_id - Get all support requests for a user
 */
router.get('/user/:user_id', supportController.getUserSupport);

/**
 * GET /v2/support/:support_id - Get support request by ID
 */
router.get('/:support_id', supportController.getSupportRequest);

/**
 * PUT /v2/support/:support_id/status - Update support request status
 */
router.put('/:support_id/status', supportController.updateSupportStatus);

/**
 * PUT /v2/support/:support_id/respond - Add response to support request
 */
router.put('/:support_id/respond', supportController.respondToSupport);

/**
 * DELETE /v2/support/:support_id - Delete support request
 */
router.delete('/:support_id', supportController.deleteSupport);

module.exports = router;
