const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { addClient } = require('../utils/sse');

// GET /notifications/stream — SSE endpoint
router.get('/stream', protect, (req, res) => {
  addClient(req.user._id, res);
});

module.exports = router;
