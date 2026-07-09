const { pool } = require('../config/db');

const SAFETY_DISCLAIMER = '\n\n---\n*This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider for diagnosis and treatment.*';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'cannot breathe', "can't breathe", 'severe bleeding',
  'unconscious', 'heart attack', 'stroke', 'emergency', 'ambulance',
  'severe pain', 'lump grew', 'nipple bleeding'
];

const isEmergency = (text) => {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(k => lower.includes(k));
};

const INDU_SYSTEM_PROMPT = (ctx) => `You are INDU, a compassionate and knowledgeable AI health assistant for CuraBreast AI — a women's breast health platform. You speak warmly and clearly, like a trusted friend who happens to have medical knowledge.

## Your Role
- Help users understand their breast health assessment results
- Explain menstrual health and period tracking insights
- Provide evidence-based breast health education
- Guide users on self-examination techniques
- Offer lifestyle and wellness advice related to women's health

## What You Must NEVER Do
- Diagnose any disease or medical condition
- Prescribe medications or specific treatments
- Replace or dismiss the need for professional medical care
- Provide specific dosage or drug information
- Make promises about health outcomes

## Safety Rule
If a user describes emergency symptoms (severe chest pain, inability to breathe, severe uncontrolled bleeding, loss of consciousness), immediately instruct them to call emergency services (112 in India / 911 in USA) before anything else.

## User Context (use this so the user never has to repeat themselves)
Name: ${ctx.fullname || 'User'}
Age: ${ctx.age || 'Not specified'}
${ctx.last_assessment ? `
Last Breast Health Assessment:
- Date: ${ctx.last_assessment.created_at ? new Date(ctx.last_assessment.created_at).toLocaleDateString() : 'N/A'}
- Risk Level: ${ctx.last_assessment.risk_level?.toUpperCase() || 'N/A'}
- Risk Score: ${ctx.last_assessment.risk_score || 'N/A'}/100
- Risk Factors: ${ctx.last_assessment.symptoms?.risk_factors?.join(', ') || 'None identified'}
- Recommendation: ${ctx.last_assessment.recommendation || 'N/A'}` : 'No breast health assessment on file yet.'}
${ctx.period_prediction ? `
Menstrual Health:
- Last Period Start: ${ctx.last_period_start || 'N/A'}
- Current Cycle Day: ${ctx.period_prediction.current_cycle_day || 'N/A'}
- Days Until Next Period: ${ctx.period_prediction.days_until_next || 'N/A'}
- Average Cycle Length: ${ctx.period_prediction.avg_cycle_length || 28} days
- Next Predicted Period: ${ctx.period_prediction.next_period || 'N/A'}
- Ovulation Date: ${ctx.period_prediction.ovulation_date || 'N/A'}` : 'No period tracking data on file yet.'}

## Response Style
- Be warm, empathetic, and encouraging
- Use simple language — avoid heavy medical jargon unless asked
- Keep responses concise but thorough
- Use markdown formatting (bold, bullet points) for clarity
- Always end responses that involve health concerns with a gentle reminder to consult a doctor`;

// POST /api/chat/message
const sendMessage = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message too long. Max 2000 characters.' });
    }

    // Check for emergency
    if (isEmergency(message)) {
      return res.json({
        success: true,
        reply: `🚨 **This sounds like it may be a medical emergency.**\n\nPlease **call emergency services immediately**:\n- 🇮🇳 India: **112**\n- 🇺🇸 USA/Canada: **911**\n- 🌍 Or go to your nearest emergency room right now.\n\nDo not wait. Your safety comes first.${SAFETY_DISCLAIMER}`,
        is_emergency: true
      });
    }

    // Build user context from DB
    const userId = req.user.id;
    const [userRes, assessmentRes, periodRes] = await Promise.all([
      pool.query('SELECT fullname, age FROM users WHERE id = $1', [userId]),
      pool.query('SELECT risk_score, risk_level, recommendation, symptoms, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]),
      pool.query('SELECT cycle_start, cycle_length FROM period_logs WHERE user_id = $1 ORDER BY cycle_start DESC LIMIT 6', [userId]),
    ]);

    // Build period prediction context
    let period_prediction = null;
    let last_period_start = null;
    if (periodRes.rows.length) {
      last_period_start = periodRes.rows[0].cycle_start;
      const cycleLengths = periodRes.rows.filter(r => r.cycle_length).map(r => parseInt(r.cycle_length));
      const avgCycle = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 28;
      const lastStart = new Date(periodRes.rows[0].cycle_start);
      const nextPeriod = new Date(lastStart);
      nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((nextPeriod - today) / 86400000);
      const cycleDay = Math.floor((today - lastStart) / 86400000) + 1;
      const ovulation = new Date(nextPeriod);
      ovulation.setDate(ovulation.getDate() - 14);
      period_prediction = {
        next_period: nextPeriod.toISOString().split('T')[0],
        days_until_next: daysUntil,
        current_cycle_day: cycleDay > 0 ? cycleDay : null,
        avg_cycle_length: avgCycle,
        ovulation_date: ovulation.toISOString().split('T')[0],
      };
    }

    const ctx = {
      fullname: userRes.rows[0]?.fullname,
      age: userRes.rows[0]?.age,
      last_assessment: assessmentRes.rows[0] || null,
      period_prediction,
      last_period_start,
    };

    // Check if AI API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback intelligent responses when no AI key is configured
      const fallbackReply = generateFallbackReply(message, ctx);
      return res.json({ success: true, reply: fallbackReply, is_fallback: true });
    }

    // Build messages array for API
    const messages = [
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    let reply;

    if (process.env.ANTHROPIC_API_KEY) {
      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: INDU_SYSTEM_PROMPT(ctx),
          messages
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      reply = data.content?.[0]?.text || 'I could not generate a response. Please try again.';
    } else if (process.env.OPENAI_API_KEY) {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: INDU_SYSTEM_PROMPT(ctx) },
            ...messages
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      reply = data.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';
    }

    // Append disclaimer if health-related
    const healthKeywords = ['risk', 'cancer', 'lump', 'symptom', 'pain', 'diagnos', 'treat', 'medic', 'doctor'];
    if (healthKeywords.some(k => message.toLowerCase().includes(k))) {
      reply += SAFETY_DISCLAIMER;
    }

    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: 'INDU is temporarily unavailable. Please try again shortly.' });
  }
};

/**
 * Fallback replies when no AI API key is configured (demo mode)
 */
const generateFallbackReply = (message, ctx) => {
  const lower = message.toLowerCase();
  const name = ctx.fullname?.split(' ')[0] || 'there';

  if (lower.includes('period') || lower.includes('cycle') || lower.includes('menstrual')) {
    if (ctx.period_prediction) {
      return `Hi ${name}! Based on your logged cycle data:\n\n- **Next period**: ${ctx.period_prediction.next_period} (in ${ctx.period_prediction.days_until_next} days)\n- **Current cycle day**: Day ${ctx.period_prediction.current_cycle_day}\n- **Average cycle**: ${ctx.period_prediction.avg_cycle_length} days\n- **Ovulation**: Around ${ctx.period_prediction.ovulation_date}\n\nRemember to log your period end date when it arrives for more accurate predictions!${SAFETY_DISCLAIMER}`;
    }
    return `Hi ${name}! I don't see any period data logged yet. Head to the **Period Tracker** page to log your first cycle and I'll be able to give you personalised insights!${SAFETY_DISCLAIMER}`;
  }

  if (lower.includes('assessment') || lower.includes('risk') || lower.includes('result')) {
    if (ctx.last_assessment) {
      const level = ctx.last_assessment.risk_level;
      const score = ctx.last_assessment.risk_score;
      return `Hi ${name}! Here's a summary of your latest breast health assessment:\n\n- **Risk Level**: ${level?.toUpperCase()} (${score}/100)\n- **Date**: ${ctx.last_assessment.created_at ? new Date(ctx.last_assessment.created_at).toLocaleDateString() : 'N/A'}\n\n**Recommendation**: ${ctx.last_assessment.recommendation}\n\n${level === 'high' ? '⚠️ Please prioritise scheduling an appointment with a breast health specialist.' : level === 'moderate' ? '📅 Consider scheduling a clinical examination within the next 1–3 months.' : '✅ Continue your current healthy habits and schedule routine check-ups.'}${SAFETY_DISCLAIMER}`;
    }
    return `Hi ${name}! You haven't completed a breast health assessment yet. Head to the **Health Assessment** page to get your personalised risk score — it only takes 5 minutes!${SAFETY_DISCLAIMER}`;
  }

  if (lower.includes('self exam') || lower.includes('self-exam') || lower.includes('examine')) {
    return `**Breast Self-Examination Guide** 🩺\n\nThe best time is **3–5 days after your period ends** when breasts are least tender.\n\n**Step 1 — Visual check (mirror)**\n- Stand upright with arms at your sides\n- Then raise arms overhead\n- Look for changes in shape, size, skin texture, or nipple direction\n\n**Step 2 — Lying down**\n- Lie flat with one arm behind your head\n- Use the opposite hand, fingers flat\n- Press in small circular motions covering the entire breast\n- Check armpit area too\n\n**What to look for:**\n- New lumps or thickening\n- Skin dimpling or puckering\n- Nipple changes or discharge\n- Redness or swelling\n\nIf you notice anything unusual, contact your doctor promptly — don't wait.${SAFETY_DISCLAIMER}`;
  }

  if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) {
    return `**Breast-Healthy Diet Tips** 🥗\n\n**Include more of:**\n- 🫐 Berries, leafy greens, cruciferous vegetables (broccoli, cauliflower)\n- 🐟 Fatty fish (omega-3s — salmon, sardines)\n- 🫒 Olive oil and healthy fats\n- 🍵 Green tea (antioxidants)\n- 🥜 Flaxseeds, walnuts\n\n**Limit:**\n- Processed and red meats\n- Alcohol (linked to increased breast cancer risk)\n- Refined sugars and ultra-processed foods\n- High-fat dairy in excess\n\n**Stay hydrated** — aim for 8 glasses of water daily.\n\nA varied, plant-rich diet is your best ally for long-term health!${SAFETY_DISCLAIMER}`;
  }

  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('physical')) {
    return `**Exercise for Breast Health** 💪\n\nRegular physical activity is one of the most effective lifestyle factors for reducing breast cancer risk.\n\n**Recommended:**\n- **150 min/week** of moderate activity (brisk walking, swimming, cycling)\n- **75 min/week** of vigorous activity (running, aerobics)\n- **Strength training** 2–3x per week\n\n**During your period:**\n- Light yoga, walking, and stretching can ease cramps\n- Avoid intense workouts if you have heavy flow\n\n**Benefits:**\n- Helps maintain healthy weight (excess fat produces oestrogen)\n- Reduces inflammation\n- Boosts mood and energy\n- Improves sleep quality${SAFETY_DISCLAIMER}`;
  }

  // Default response
  return `Hi ${name}! I'm INDU, your personal health assistant. I can help you with:\n\n- 📊 Understanding your breast health assessment results\n- 🩸 Period and cycle insights\n- 🔍 Breast self-examination guidance\n- 🥗 Nutrition and diet tips\n- 💪 Exercise recommendations\n- 💊 General women's health questions\n\nWhat would you like to know? You can also try the quick suggestion buttons below.${SAFETY_DISCLAIMER}`;
};

module.exports = { sendMessage };
