const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  logPeriod, updateLog, getHistory,
  getPrediction, getStats, deleteLog
} = require('../controllers/periodController');

const router = express.Router();
router.use(authenticate);

router.post('/log', logPeriod);
router.put('/log/:id', updateLog);
router.delete('/log/:id', deleteLog);
router.get('/history', getHistory);
router.get('/predict', getPrediction);
router.get('/stats', getStats);

module.exports = router;
