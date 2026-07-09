const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Generate JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullname, email, phone, age, password } = req.body;

    // Check email uniqueness
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (fullname, email, phone, age, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'user')
       RETURNING id, fullname, email, phone, age, role, created_at`,
      [fullname, email.toLowerCase(), phone || null, parseInt(age), password_hash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone, age: user.age, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, fullname, email, phone, age, password_hash, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone, age: user.age, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const result = await pool.query('SELECT id, fullname FROM users WHERE email = $1', [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (!result.rows.length) {
      return res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate old tokens
    await pool.query('UPDATE password_resets SET used = TRUE WHERE user_id = $1', [user.id]);

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // In production, send email here
    console.log(`Password reset token for ${email}: ${token}`);

    res.json({
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
      // Remove in production - only for development
      debug_token: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const result = await pool.query(
      `SELECT pr.id, pr.user_id FROM password_resets pr
       WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const { id: resetId, user_id } = result.rows[0];

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, user_id]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetId]);

    res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
