const { pool } = require('../config/db');

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, a.risk_score, a.risk_level, a.recommendation, a.created_at as assessment_date
       FROM reports r
       LEFT JOIN assessments a ON r.assessment_id = a.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, reports: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/reports/:id
const getReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, a.*, u.fullname, u.email, u.age
       FROM reports r
       LEFT JOIN assessments a ON r.assessment_id = a.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getReports, getReport };
