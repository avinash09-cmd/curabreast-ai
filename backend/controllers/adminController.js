const { pool } = require('../config/db');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [usersResult, assessmentsResult, highRiskResult, recentUsers, recentAssessments] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      pool.query('SELECT COUNT(*) FROM assessments'),
      pool.query("SELECT COUNT(*) FROM assessments WHERE risk_level = 'high'"),
      pool.query('SELECT id, fullname, email, age, created_at FROM users ORDER BY created_at DESC LIMIT 5'),
      pool.query("SELECT a.*, u.fullname, u.email FROM assessments a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 5")
    ]);

    res.json({
      success: true,
      stats: {
        total_users: parseInt(usersResult.rows[0].count),
        total_assessments: parseInt(assessmentsResult.rows[0].count),
        high_risk_cases: parseInt(highRiskResult.rows[0].count),
      },
      recent_users: recentUsers.rows,
      recent_assessments: recentAssessments.rows
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = "SELECT id, fullname, email, phone, age, role, is_active, created_at, last_login FROM users WHERE role = 'user'";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (fullname ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    params.push(parseInt(limit), offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    const countResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");

    res.json({
      success: true,
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 AND role != $2 RETURNING id', [id, 'admin']);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/assessments
const getAssessments = async (req, res) => {
  try {
    const { risk_level, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT a.*, u.fullname, u.email FROM assessments a
                 JOIN users u ON a.user_id = u.id`;
    const params = [];

    if (risk_level && ['low', 'moderate', 'high'].includes(risk_level)) {
      params.push(risk_level);
      query += ` WHERE a.risk_level = $${params.length}`;
    }

    params.push(parseInt(limit), offset);
    query += ` ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM assessments');

    res.json({
      success: true,
      assessments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboard, getUsers, deleteUser, getAssessments };
