const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Risk scoring algorithm
 * Simulates ML-based assessment using weighted symptom analysis
 */
const calculateRisk = (data) => {
  let score = 0;
  const factors = [];

  // Age-based risk (higher risk with age)
  const age = parseInt(data.age);
  if (age >= 60) { score += 20; factors.push('Age over 60'); }
  else if (age >= 50) { score += 15; factors.push('Age 50-59'); }
  else if (age >= 40) { score += 10; factors.push('Age 40-49'); }
  else if (age >= 30) { score += 5; factors.push('Age 30-39'); }

  // High-risk clinical symptoms
  if (data.lump_detected) { score += 25; factors.push('Lump detected'); }
  if (data.nipple_discharge) { score += 20; factors.push('Nipple discharge'); }
  if (data.skin_changes) { score += 15; factors.push('Skin changes observed'); }
  if (data.breast_pain) { score += 10; factors.push('Breast pain reported'); }

  // Family/genetic history
  if (data.family_history) { score += 20; factors.push('Family history of breast cancer'); }

  // Lifestyle factors
  if (data.smoking_history) { score += 10; factors.push('Smoking history'); }

  const alcohol = data.alcohol_consumption || 'none';
  if (alcohol === 'heavy') { score += 10; factors.push('Heavy alcohol consumption'); }
  else if (alcohol === 'moderate') { score += 5; factors.push('Moderate alcohol consumption'); }

  const activity = data.physical_activity || 'moderate';
  if (activity === 'sedentary') { score += 10; factors.push('Sedentary lifestyle'); }
  else if (activity === 'active') { score -= 5; } // Protective factor

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  // Determine risk level
  let risk_level, recommendation;
  if (score < 30) {
    risk_level = 'low';
    recommendation = `Your current assessment indicates a LOW risk level (score: ${score}/100). Continue with routine annual mammograms if you are over 40. Maintain a healthy lifestyle with regular exercise and balanced diet. Perform monthly self-breast examinations. Stay informed about changes in your body and schedule regular check-ups with your gynecologist.`;
  } else if (score < 60) {
    risk_level = 'moderate';
    recommendation = `Your assessment indicates a MODERATE risk level (score: ${score}/100). We recommend scheduling a clinical breast examination with your doctor within the next 1-3 months. Consider a mammogram or ultrasound based on your doctor's advice. ${data.family_history ? 'Given your family history, genetic counseling may be beneficial. ' : ''}Increase self-breast exams to bi-weekly. Focus on reducing modifiable risk factors including alcohol consumption and increasing physical activity.`;
  } else {
    risk_level = 'high';
    recommendation = `Your assessment indicates a HIGH risk level (score: ${score}/100). We strongly recommend seeking immediate medical evaluation. Please consult a breast health specialist or oncologist within the next week. ${data.lump_detected ? 'The detected lump requires urgent professional examination. ' : ''}${data.nipple_discharge ? 'Nipple discharge should be evaluated promptly. ' : ''}Do not delay seeking medical care. Early detection significantly improves treatment outcomes.`;
  }

  return { risk_score: score, risk_level, recommendation, risk_factors: factors };
};

// POST /api/assessment
const createAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      age, family_history, lump_detected, breast_pain,
      skin_changes, nipple_discharge, smoking_history,
      alcohol_consumption, physical_activity
    } = req.body;

    const { risk_score, risk_level, recommendation, risk_factors } = calculateRisk(req.body);

    const symptoms = {
      family_history: !!family_history,
      lump_detected: !!lump_detected,
      breast_pain: !!breast_pain,
      skin_changes: !!skin_changes,
      nipple_discharge: !!nipple_discharge,
      smoking_history: !!smoking_history,
      alcohol_consumption: alcohol_consumption || 'none',
      physical_activity: physical_activity || 'moderate',
      risk_factors
    };

    const result = await pool.query(
      `INSERT INTO assessments
        (user_id, age, family_history, lump_detected, breast_pain, skin_changes,
         nipple_discharge, smoking_history, alcohol_consumption, physical_activity,
         symptoms, risk_score, risk_level, recommendation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        userId, parseInt(age),
        !!family_history, !!lump_detected, !!breast_pain, !!skin_changes,
        !!nipple_discharge, !!smoking_history,
        alcohol_consumption || 'none', physical_activity || 'moderate',
        JSON.stringify(symptoms), risk_score, risk_level, recommendation
      ]
    );

    // Auto-create a report record
    await pool.query(
      'INSERT INTO reports (user_id, assessment_id, report_type, report_data) VALUES ($1, $2, $3, $4)',
      [userId, result.rows[0].id, 'assessment', JSON.stringify({ risk_score, risk_level, risk_factors })]
    );

    res.status(201).json({
      success: true,
      message: 'Assessment completed successfully.',
      assessment: result.rows[0],
      risk_score,
      risk_level,
      recommendation,
      risk_factors
    });
  } catch (err) {
    console.error('Assessment error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// GET /api/assessment/history
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, risk_level } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM assessments WHERE user_id = $1';
    const params = [userId];

    if (risk_level && ['low', 'moderate', 'high'].includes(risk_level)) {
      query += ` AND risk_level = $${params.length + 1}`;
      params.push(risk_level);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM assessments WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      assessments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/assessment/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalResult = await pool.query(
      'SELECT COUNT(*) as total, AVG(risk_score) as avg_score FROM assessments WHERE user_id = $1',
      [userId]
    );

    const lastResult = await pool.query(
      'SELECT risk_score, risk_level, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const trendResult = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, AVG(risk_score) as avg_score, COUNT(*) as count
       FROM assessments WHERE user_id = $1
       GROUP BY month ORDER BY month DESC LIMIT 6`,
      [userId]
    );

    const appointmentsResult = await pool.query(
      "SELECT COUNT(*) as total FROM appointments WHERE user_id = $1 AND status != 'cancelled'",
      [userId]
    );

    res.json({
      success: true,
      stats: {
        total_assessments: parseInt(totalResult.rows[0].total),
        avg_risk_score: Math.round(parseFloat(totalResult.rows[0].avg_score) || 0),
        last_assessment: lastResult.rows[0] || null,
        appointments_booked: parseInt(appointmentsResult.rows[0].total),
        trend: trendResult.rows
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createAssessment, getHistory, getStats };
