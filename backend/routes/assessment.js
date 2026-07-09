const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { createAssessment, getHistory, getStats } = require('../controllers/assessmentController');

const router = express.Router();

router.use(authenticate);

router.post('/', [
  body('age').isInt({ min: 18, max: 120 }).withMessage('Valid age required'),
  body('alcohol_consumption').optional().isIn(['none', 'occasional', 'moderate', 'heavy']),
  body('physical_activity').optional().isIn(['sedentary', 'light', 'moderate', 'active'])
], createAssessment);

router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
