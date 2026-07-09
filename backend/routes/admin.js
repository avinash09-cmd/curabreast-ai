const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getDashboard, getUsers, deleteUser, getAssessments } = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/assessments', getAssessments);

module.exports = router;
