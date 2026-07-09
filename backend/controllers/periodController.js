const { pool } = require('../config/db');

/**
 * Calculate average from array of numbers, returns null if empty
 */
const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

/**
 * Given sorted (desc) period logs, predict next period start and fertility window
 */
const predictNext = (logs) => {
  if (!logs.length) return null;

  const latest = logs[0];
  const cyclesWithLength = logs.filter(l => l.cycle_length).map(l => parseInt(l.cycle_length));
  const avgCycle = cyclesWithLength.length ? avg(cyclesWithLength) : 28;

  const lastStart = new Date(latest.cycle_start);
  const nextStart = new Date(lastStart);
  nextStart.setDate(nextStart.getDate() + avgCycle);

  // Ovulation typically 14 days before next period
  const ovulation = new Date(nextStart);
  ovulation.setDate(ovulation.getDate() - 14);

  // Fertility window: 5 days before + day of ovulation
  const fertilityStart = new Date(ovulation);
  fertilityStart.setDate(fertilityStart.getDate() - 5);
  const fertilityEnd = new Date(ovulation);
  fertilityEnd.setDate(fertilityEnd.getDate() + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((nextStart - today) / (1000 * 60 * 60 * 24));

  // Current cycle day
  const cycleDay = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24)) + 1;

  return {
    next_period: nextStart.toISOString().split('T')[0],
    days_until_next: daysUntil,
    ovulation_date: ovulation.toISOString().split('T')[0],
    fertility_start: fertilityStart.toISOString().split('T')[0],
    fertility_end: fertilityEnd.toISOString().split('T')[0],
    current_cycle_day: cycleDay > 0 ? cycleDay : null,
    avg_cycle_length: avgCycle,
  };
};

// POST /api/period/log
const logPeriod = async (req, res) => {
  try {
    const { cycle_start, cycle_end, flow, mood, symptoms, notes } = req.body;

    if (!cycle_start) {
      return res.status(400).json({ success: false, message: 'Cycle start date is required.' });
    }

    const startDate = new Date(cycle_start);
    if (isNaN(startDate)) {
      return res.status(400).json({ success: false, message: 'Invalid cycle start date.' });
    }

    // Calculate period_length if end date provided
    let period_length = null;
    if (cycle_end) {
      const endDate = new Date(cycle_end);
      period_length = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate cycle_length using the previous log
    let cycle_length = null;
    const prevLog = await pool.query(
      'SELECT cycle_start FROM period_logs WHERE user_id = $1 AND cycle_start < $2 ORDER BY cycle_start DESC LIMIT 1',
      [req.user.id, cycle_start]
    );
    if (prevLog.rows.length) {
      const prevStart = new Date(prevLog.rows[0].cycle_start);
      cycle_length = Math.ceil((startDate - prevStart) / (1000 * 60 * 60 * 24));
      // Also update the prev log's cycle_length
      await pool.query(
        'UPDATE period_logs SET cycle_length = $1 WHERE user_id = $2 AND cycle_start = $3',
        [cycle_length, req.user.id, prevLog.rows[0].cycle_start]
      );
    }

    const result = await pool.query(
      `INSERT INTO period_logs
         (user_id, cycle_start, cycle_end, period_length, cycle_length, flow, mood, symptoms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        req.user.id,
        cycle_start,
        cycle_end || null,
        period_length,
        cycle_length,
        flow || 'medium',
        mood || 'neutral',
        JSON.stringify(symptoms || []),
        notes || null
      ]
    );

    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: 'A log for this start date already exists.' });
    }

    res.status(201).json({ success: true, message: 'Period logged successfully.', log: result.rows[0] });
  } catch (err) {
    console.error('Log period error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/period/log/:id — update existing log (e.g. add end date later)
const updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { cycle_end, flow, mood, symptoms, notes } = req.body;

    const existing = await pool.query(
      'SELECT * FROM period_logs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, message: 'Log not found.' });
    }

    const log = existing.rows[0];
    let period_length = log.period_length;
    if (cycle_end) {
      const start = new Date(log.cycle_start);
      const end = new Date(cycle_end);
      period_length = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    const result = await pool.query(
      `UPDATE period_logs SET
         cycle_end = COALESCE($1, cycle_end),
         period_length = $2,
         flow = COALESCE($3, flow),
         mood = COALESCE($4, mood),
         symptoms = COALESCE($5, symptoms),
         notes = COALESCE($6, notes),
         updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [cycle_end || null, period_length, flow || null, mood || null,
       symptoms ? JSON.stringify(symptoms) : null, notes || null, id, req.user.id]
    );

    res.json({ success: true, message: 'Log updated.', log: result.rows[0] });
  } catch (err) {
    console.error('Update log error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/period/history
const getHistory = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const result = await pool.query(
      'SELECT * FROM period_logs WHERE user_id = $1 ORDER BY cycle_start DESC LIMIT $2',
      [req.user.id, parseInt(limit)]
    );
    res.json({ success: true, logs: result.rows });
  } catch (err) {
    console.error('Get period history error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/period/predict
const getPrediction = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM period_logs WHERE user_id = $1 ORDER BY cycle_start DESC LIMIT 6',
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({ success: true, prediction: null, message: 'Log at least one period to get predictions.' });
    }

    const prediction = predictNext(result.rows);
    res.json({ success: true, prediction });
  } catch (err) {
    console.error('Predict error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/period/stats
const getStats = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM period_logs WHERE user_id = $1 ORDER BY cycle_start DESC LIMIT 12',
      [req.user.id]
    );

    const logs = result.rows;
    const cycleLengths = logs.filter(l => l.cycle_length).map(l => parseInt(l.cycle_length));
    const periodLengths = logs.filter(l => l.period_length).map(l => parseInt(l.period_length));

    // Symptom frequency
    const symptomCount = {};
    logs.forEach(l => {
      const syms = Array.isArray(l.symptoms) ? l.symptoms : (l.symptoms || []);
      syms.forEach(s => { symptomCount[s] = (symptomCount[s] || 0) + 1; });
    });

    // Mood distribution
    const moodCount = {};
    logs.forEach(l => {
      if (l.mood) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1;
    });

    // Chart data — last 6 cycles
    const chartData = logs.slice(0, 6).reverse().map(l => ({
      month: new Date(l.cycle_start).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      cycle_length: l.cycle_length || null,
      period_length: l.period_length || null,
    }));

    res.json({
      success: true,
      stats: {
        total_cycles: logs.length,
        avg_cycle_length: avg(cycleLengths),
        avg_period_length: avg(periodLengths),
        min_cycle: cycleLengths.length ? Math.min(...cycleLengths) : null,
        max_cycle: cycleLengths.length ? Math.max(...cycleLengths) : null,
        symptom_frequency: symptomCount,
        mood_distribution: moodCount,
        chart_data: chartData,
        prediction: logs.length ? predictNext(logs) : null,
      }
    });
  } catch (err) {
    console.error('Period stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/period/log/:id
const deleteLog = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM period_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Log not found.' });
    }
    res.json({ success: true, message: 'Log deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { logPeriod, updateLog, getHistory, getPrediction, getStats, deleteLog };
