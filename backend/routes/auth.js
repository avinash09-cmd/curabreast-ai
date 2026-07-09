const express = require('express');
const { body } = require('express-validator');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('fullname').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
