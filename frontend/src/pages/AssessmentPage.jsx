import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, ExclamationTriangleIcon,
  ArrowRightIcon, ArrowLeftIcon, SparklesIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const questions = [
  { id: 'age', label: 'What is your current age?', type: 'number', placeholder: 'e.g. 35', required: true, min: 18, max: 120 },
  { id: 'family_history', label: 'Do you have a family history of breast cancer? (mother, sister, daughter)', type: 'boolean' },
  { id: 'lump_detected', label: 'Have you noticed any lump or thickening in your breast or underarm?', type: 'boolean' },
  { id: 'breast_pain', label: 'Are you experiencing breast pain or discomfort not related to your menstrual cycle?', type: 'boolean' },
  { id: 'skin_changes', label: 'Have you noticed any changes in the skin of your breast? (dimpling, redness, rash)', type: 'boolean' },
  { id: 'nipple_discharge', label: 'Have you experienced any nipple discharge (other than breastmilk)?', type: 'boolean' },
  { id: 'smoking_history', label: 'Do you have a history of smoking?', type: 'boolean' },
  {
    id: 'alcohol_consumption',
    label: 'How would you describe your alcohol consumption?',
    type: 'select',
    options: [
      { value: 'none', label: 'None — I do not drink' },
      { value: 'occasional', label: 'Occasional — A few drinks per month' },
      { value: 'moderate', label: 'Moderate — A few drinks per week' },
      { value: 'heavy', label: 'Heavy — Daily or near-daily drinking' },
    ]
  },
  {
    id: 'physical_activity',
    label: 'How active are you physically?',
    type: 'select',
    options: [
      { value: 'sedentary', label: 'Sedentary — Little to no regular exercise' },
      { value: 'light', label: 'Light — 1–2 days of light activity per week' },
      { value: 'moderate', label: 'Moderate — 3–4 days of moderate exercise per week' },
      { value: 'active', label: 'Active — 5+ days of vigorous exercise per week' },
    ]
  },
];

const RiskResult = ({ result, onReset }) => {
  const configs = {
    low: { gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '🟢', badge: 'bg-green-100 text-green-700', label: 'Low Risk' },
    moderate: { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '🟡', badge: 'bg-amber-100 text-amber-700', label: 'Moderate Risk' },
    high: { gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔴', badge: 'bg-red-100 text-red-700', label: 'High Risk' },
  };
  const cfg = configs[result.risk_level] || configs.low;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Score card */}
      <div className={`bg-gradient-to-br ${cfg.gradient} rounded-2xl p-8 text-white text-center shadow-xl mb-6`}>
        <div className="text-5xl mb-3">{cfg.icon}</div>
        <div className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-1">Assessment Complete</div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{cfg.label}</h2>
        <div className="text-6xl font-bold my-4">{result.risk_score}<span className="text-2xl text-white/70">/100</span></div>
        <p className="text-white/80 text-sm">Risk Score</p>
      </div>

      {/* Recommendation */}
      <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-6 mb-6`}>
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className={`w-6 h-6 ${cfg.text} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className={`font-bold ${cfg.text} mb-2`}>Our Recommendation</h3>
            <p className={`text-sm ${cfg.text} leading-relaxed`}>{result.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Risk factors */}
      {result.risk_factors?.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            Identified Risk Factors
          </h3>
          <div className="space-y-2">
            {result.risk_factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-rose-400 rounded-full flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onReset} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> New Assessment
        </button>
        <Link to="/reports" className="btn-primary flex-1 flex items-center justify-center gap-2">
          View Reports <ArrowRightIcon className="w-4 h-4" />
        </Link>
        {result.risk_level === 'high' && (
          <Link to="/hospitals" className="btn-primary bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-2">
            Find Hospital <ArrowRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default function AssessmentPage() {
  const [answers, setAnswers] = useState({ alcohol_consumption: 'none', physical_activity: 'moderate' });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const currentQ = questions[step];
  const progress = ((step) / questions.length) * 100;

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    const val = answers[currentQ.id];
    if (currentQ.required && (val === undefined || val === '')) {
      setError('Please answer this question to continue.');
      return;
    }
    setError('');
    if (step < questions.length - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/assessment', answers);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (result) return <RiskResult result={result} onReset={() => { setResult(null); setStep(0); setAnswers({ alcohol_consumption: 'none', physical_activity: 'moderate' }); }} />;

  const isLastStep = step === questions.length - 1;
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="section-label flex items-center gap-2">
          <SparklesIcon className="w-4 h-4" />
          AI-Powered Assessment
        </div>
        <h1 className="page-title">Breast Health Risk Assessment</h1>
        <p className="text-gray-500 text-sm">Answer {questions.length} questions to get your personalised risk analysis.</p>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-medium text-gray-600">Question {step + 1} of {questions.length}</span>
          <span className="text-rose-600 font-semibold">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-rose rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1 mt-3">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-rose-400' : i === step ? 'bg-rose-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card mb-4 min-h-[280px] flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center mb-4 text-white font-bold text-sm">
            {step + 1}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 leading-snug">{currentQ.label}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Boolean question */}
          {currentQ.type === 'boolean' && (
            <div className="grid grid-cols-2 gap-3">
              {[{ v: true, l: '✅ Yes' }, { v: false, l: '❌ No' }].map(({ v, l }) => (
                <button
                  key={String(v)}
                  onClick={() => handleAnswer(v)}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all duration-200 text-sm
                    ${currentAnswer === v
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:bg-rose-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Number input */}
          {currentQ.type === 'number' && (
            <input
              type="number"
              className="input-field text-lg font-semibold"
              placeholder={currentQ.placeholder}
              min={currentQ.min}
              max={currentQ.max}
              value={currentAnswer || ''}
              onChange={e => handleAnswer(e.target.value)}
            />
          )}

          {/* Select */}
          {currentQ.type === 'select' && (
            <div className="space-y-2">
              {currentQ.options.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`w-full p-4 rounded-xl border-2 font-medium text-left text-sm transition-all duration-200
                    ${currentAnswer === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:bg-rose-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          {step > 0 && (
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </button>
          )}
          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" /> Get My Risk Score
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Continue <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        🔒 Your answers are encrypted and kept strictly confidential.
      </p>
    </div>
  );
}
