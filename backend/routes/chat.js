const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { sendMessage } = require('../controllers/chatController');

const router = express.Router();

// Stricter rate limit for AI endpoint — 20 messages per 15 min per user
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, message: 'Too many messages. Please wait a few minutes before trying again.' }
});

router.use(authenticate);
router.post('/message', chatLimiter, sendMessage);

module.exports = router;
