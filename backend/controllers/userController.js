const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, fullname, email, phone, age, role, profile_image, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { fullname, phone, age } = req.body;
    const updates = [];
    const params = [];
    let i = 1;

    if (fullname) { updates.push(`fullname = $${i++}`); params.push(fullname); }
    if (phone !== undefined) { updates.push(`phone = $${i++}`); params.push(phone || null); }
    if (age) { updates.push(`age = $${i++}`); params.push(parseInt(age)); }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING id, fullname, email, phone, age, role`,
      params
    );

    res.json({ success: true, message: 'Profile updated.', user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, result.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/users/appointments
const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_date DESC',
      [req.user.id]
    );
    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/users/appointments
const createAppointment = async (req, res) => {
  try {
    const { hospital_name, hospital_address, doctor_name, appointment_date, appointment_type, notes } = req.body;
    if (!hospital_name || !appointment_date) {
      return res.status(400).json({ success: false, message: 'Hospital name and date are required.' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (user_id, hospital_name, hospital_address, doctor_name, appointment_date, appointment_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, hospital_name, hospital_address, doctor_name, appointment_date, appointment_type || 'consultation', notes]
    );

    res.status(201).json({ success: true, message: 'Appointment booked.', appointment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};



// GET /api/users/preferences
const getPreferences = async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
    if (!result.rows.length) {
      // Create default preferences
      result = await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
    }
    res.json({ success: true, preferences: result.rows[0] });
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/users/preferences
const updatePreferences = async (req, res) => {
  try {
    const { theme, notif_period, notif_ovulation, notif_self_exam, notif_medication, notif_ai } = req.body;

    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, theme, notif_period, notif_ovulation, notif_self_exam, notif_medication, notif_ai)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = COALESCE($2, user_preferences.theme),
         notif_period = COALESCE($3, user_preferences.notif_period),
         notif_ovulation = COALESCE($4, user_preferences.notif_ovulation),
         notif_self_exam = COALESCE($5, user_preferences.notif_self_exam),
         notif_medication = COALESCE($6, user_preferences.notif_medication),
         notif_ai = COALESCE($7, user_preferences.notif_ai),
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, theme || null, notif_period ?? null, notif_ovulation ?? null,
       notif_self_exam ?? null, notif_medication ?? null, notif_ai ?? null]
    );

    res.json({ success: true, message: 'Preferences saved.', preferences: result.rows[0] });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/users/export — export all health data as JSON
const exportData = async (req, res) => {
  try {
    const [userRes, assessmentsRes, appointmentsRes, periodsRes] = await Promise.all([
      pool.query('SELECT id, fullname, email, phone, age, created_at FROM users WHERE id = $1', [req.user.id]),
      pool.query('SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]),
      pool.query('SELECT * FROM appointments WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]),
      pool.query('SELECT * FROM period_logs WHERE user_id = $1 ORDER BY cycle_start DESC', [req.user.id]),
    ]);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      profile: userRes.rows[0],
      assessments: assessmentsRes.rows,
      appointments: appointmentsRes.rows,
      period_logs: periodsRes.rows,
    };

    res.setHeader('Content-Disposition', 'attachment; filename="curabreast-health-data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json(exportPayload);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/users/account — permanently delete account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete account.' });
    }

    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(password, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // CASCADE delete handles all related data
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: 'Account permanently deleted.' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAppointments, createAppointment, getPreferences, updatePreferences, exportData, deleteAccount };
