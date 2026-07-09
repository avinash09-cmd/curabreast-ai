const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getReports, getReport } = require('../controllers/reportController');

const router = express.Router();
router.use(authenticate);
router.get('/', getReports);
router.get('/:id', getReport);

module.exports = router;
