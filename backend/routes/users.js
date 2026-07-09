const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getProfile, updateProfile, changePassword,
  getAppointments, createAppointment,
  getPreferences, updatePreferences,
  exportData, deleteAccount
} = require('../controllers/userController');

const router = express.Router();
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/export', exportData);
router.delete('/account', deleteAccount);

module.exports = router;
