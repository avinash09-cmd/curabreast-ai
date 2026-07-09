import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon, ShieldCheckIcon, ChartBarIcon, MapPinIcon,
  ClipboardDocumentListIcon, SparklesIcon, CheckCircleIcon,
  ArrowRightIcon, BellAlertIcon
} from '@heroicons/react/24/outline';

const features = [
  { icon: SparklesIcon, title: 'AI Risk Assessment', desc: 'Advanced ML-powered analysis evaluates your symptoms and lifestyle factors to generate a personalised breast health risk score.' },
  { icon: ChartBarIcon, title: 'Health Analytics', desc: 'Track your health trends over time with intuitive charts and insights that help you understand your risk trajectory.' },
  { icon: MapPinIcon, title: 'Hospital Locator', desc: 'Find nearby oncology clinics and breast health centres with contact details and directions.' },
  { icon: BellAlertIcon, title: 'Smart Notifications', desc: 'Get reminders for self-examinations, appointment follow-ups and health check-ups tailored to your risk profile.' },
  { icon: ClipboardDocumentListIcon, title: 'Detailed Reports', desc: 'Download comprehensive PDF reports of your assessments to share with healthcare providers.' },
  { icon: ShieldCheckIcon, title: 'Privacy First', desc: 'Your health data is encrypted end-to-end. We comply with medical data standards and never share your information.' },
];

const stats = [
  { value: '94%', label: 'Assessment Accuracy' },
  { value: '50K+', label: 'Women Assessed' },
  { value: '200+', label: 'Partner Hospitals' },
  { value: '24/7', label: 'AI Availability' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-rose rounded-lg flex items-center justify-center">
              <HeartIcon className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              CuraBreast <span className="text-rose-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-rose-600 px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 gradient-soft relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-40 -z-0" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 -z-0" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5 mb-6">
              <SparklesIcon className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600 tracking-wide">AI-Powered Women's Health</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Know Your Risk.{' '}
              <span className="text-rose-500">Protect</span>{' '}
              Your Health.
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              CuraBreast AI delivers intelligent breast health risk assessments, personalised recommendations, 
              and connects you to the right care — all in one platform designed for women.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base">
                Start Free Assessment
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base">
                Sign In to Dashboard
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5">
              {['No credit card required', 'Data encrypted', 'Doctor-reviewed'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-rose-600 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{value}</div>
              <div className="text-sm text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="section-label">Platform Features</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everything You Need for<br />Breast Health Awareness
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow duration-200 group">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                  <Icon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="section-label">How It Works</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Health Journey in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up securely with your basic health information. All data is encrypted and HIPAA-compliant.' },
              { step: '02', title: 'Complete Assessment', desc: 'Answer our AI-curated questionnaire about symptoms, lifestyle, and family history in under 5 minutes.' },
              { step: '03', title: 'Get Your Results', desc: 'Receive an instant risk score, personalised recommendations, and nearby hospital suggestions.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-bold text-rose-100 mb-4 leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>{step}</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-rose">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <HeartIcon className="w-12 h-12 text-white/70 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Early Detection Saves Lives
          </h2>
          <p className="text-rose-100 text-lg mb-8">
            Join thousands of women taking control of their breast health. Your first assessment is completely free.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 duration-200">
            Start Your Free Assessment
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-rose rounded-lg flex items-center justify-center">
              <HeartIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>CuraBreast AI</span>
          </div>
          <div className="text-sm">© {new Date().getFullYear()} CuraBreast AI. All rights reserved.</div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
