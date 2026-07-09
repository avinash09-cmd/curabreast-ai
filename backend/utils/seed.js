require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, connectDB } = require('../config/db');

const seed = async () => {
  await connectDB();

  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminSalt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('Admin@123', adminSalt);

    await pool.query(`
      INSERT INTO users (fullname, email, phone, age, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, ['Dr. Admin', 'admin@curabreast.ai', '+91-9999999999', 35, adminHash]);

    // Create sample users
    const userSalt = await bcrypt.genSalt(12);
    const userHash = await bcrypt.hash('User@1234', userSalt);

    const sampleUsers = [
      ['Priya Sharma', 'priya@example.com', '+91-9876543210', 32, userHash],
      ['Meera Patel', 'meera@example.com', '+91-9876543211', 45, userHash],
      ['Anita Singh', 'anita@example.com', '+91-9876543212', 38, userHash],
    ];

    const userIds = [];
    for (const u of sampleUsers) {
      const r = await pool.query(
        `INSERT INTO users (fullname, email, phone, age, password_hash, role)
         VALUES ($1,$2,$3,$4,$5,'user') ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email
         RETURNING id`,
        u
      );
      userIds.push(r.rows[0].id);
    }

    // Create sample assessments
    const assessments = [
      [userIds[0], 32, false, false, false, false, false, false, 'none', 'active', 15, 'low'],
      [userIds[1], 45, true, false, true, false, false, false, 'occasional', 'light', 45, 'moderate'],
      [userIds[2], 38, false, true, false, true, false, false, 'moderate', 'sedentary', 65, 'high'],
    ];

    for (const a of assessments) {
      const [uid, age, fh, ld, bp, sc, nd, sh, alc, pa, score, level] = a;
      const rec = level === 'low' ? 'Continue routine check-ups.' : level === 'moderate' ? 'Schedule a clinical examination within 1-3 months.' : 'Seek immediate medical evaluation.';
      await pool.query(
        `INSERT INTO assessments (user_id, age, family_history, lump_detected, breast_pain, skin_changes, nipple_discharge, smoking_history, alcohol_consumption, physical_activity, symptoms, risk_score, risk_level, recommendation)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [uid, age, fh, ld, bp, sc, nd, sh, alc, pa, JSON.stringify({}), score, level, rec]
      );
    }

    console.log('✅ Seeding complete!');
    console.log('   Admin: admin@curabreast.ai / Admin@123');
    console.log('   User:  priya@example.com / User@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
