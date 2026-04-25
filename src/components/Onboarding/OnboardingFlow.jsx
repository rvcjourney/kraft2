import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FiArrowLeft, FiArrowRight, FiCheck, FiTarget, FiBriefcase, FiTrendingUp, FiGlobe, FiClock, FiAward } from 'react-icons/fi';
import OptionTile from '../Common/OptionTile';
import { onboardingAPI } from '../../services/supabaseAPI';
import { useOnboardingStore } from '../../store/userStore';
import './OnboardingFlow.css';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    preferred_languages: ['en'],
    user_type: '',
    goal: '',
    industry: '',
    target_role: '',
    learning_pace: '',
  });

  const setProfile = useOnboardingStore((s) => s.setProfile);
  const setLearningPath = useOnboardingStore((s) => s.setLearningPath);
  const setCompleted = useOnboardingStore((s) => s.setCompleted);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const langs = prev.preferred_languages;
      return {
        ...prev,
        preferred_languages: langs.includes(lang)
          ? langs.filter((l) => l !== lang)
          : [...langs, lang],
      };
    });
  };

  const validateStep = () => {
    const rules = {
      1: [formData.preferred_languages.length > 0, 'Please select at least one language'],
      2: [!!formData.user_type,    'Please select your background'],
      3: [!!formData.goal,         'Please select a learning goal'],
      4: [!!formData.industry,     'Please select an industry'],
      5: [!!formData.target_role,  'Please select a target role'],
      6: [!!formData.learning_pace,'Please select a learning pace'],
    };
    const rule = rules[step];
    if (rule && !rule[0]) { setError(rule[1]); return false; }
    setError('');
    return true;
  };

  const handleNext = () => { if (validateStep() && step < 7) setStep(step + 1); };
  const handlePrev = () => { if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const response = await onboardingAPI.complete(formData);
      if (response.success) {
        setProfile(formData);
        setLearningPath(response.data.learning_path);
        setCompleted(true);
        setTimeout(() => onComplete?.(), 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const userTypeOptions = [
    { value: 'college_student', label: 'College Student',  icon: FiTrendingUp },
    { value: 'professional',    label: 'Professional',     icon: FiBriefcase },
    { value: 'school_student',  label: 'School Student',   icon: FiGlobe },
    { value: 'fresher',         label: 'Fresher',          icon: FiTarget },
  ];

  const goalOptions = [
    { value: 'get_job',        label: 'Get a Job',        icon: FiBriefcase },
    { value: 'improve_skills', label: 'Improve Skills',   icon: FiTrendingUp },
    { value: 'interview_prep', label: 'Interview Prep',   icon: FiTarget },
    { value: 'upskill',        label: 'Upskill / Growth', icon: FiTrendingUp },
  ];

  const industryOptions = [
    { value: 'bfsi',       label: 'Banking & Finance', icon: FiBriefcase },
    { value: 'insurance',  label: 'Insurance',         icon: FiTrendingUp },
    { value: 'retail',     label: 'Retail',            icon: FiGlobe },
    { value: 'telecom',    label: 'Telecom',           icon: FiTarget },
    { value: 'automotive', label: 'Automotive',        icon: FiBriefcase },
  ];

  const roleOptions = {
    bfsi: [
      { value: 'sales_assets',      label: 'Sales Officer – Assets',        icon: FiBriefcase },
      { value: 'sales_liabilities', label: 'Sales Officer – Liabilities',   icon: FiBriefcase },
      { value: 'collections',       label: 'Collections Officer',           icon: FiBriefcase },
      { value: 'credit',            label: 'Credit Officer',                icon: FiBriefcase },
      { value: 'operations',        label: 'Branch Operations Executive',   icon: FiBriefcase },
    ],
    
    insurance:  [
      { value: 'sales_general', label: 'Sales Officer General Insurance', icon: FiBriefcase },
      { value: 'sales_life',    label: 'Sales Officer Life Insurance',    icon: FiBriefcase },
    ],
    retail:     [
      { value: 'sales_exec', label: 'Sales Executive', icon: FiBriefcase },
      { value: 'store_mgr',  label: 'Store Manager',   icon: FiBriefcase },
    ],
    telecom:    [
      { value: 'sales_exec',   label: 'Sales Executive',           icon: FiBriefcase },
      { value: 'cust_service', label: 'Customer Service Executive', icon: FiBriefcase },
    ],
    automotive: [
      { value: 'sales_exec',  label: 'Sales Executive',  icon: FiBriefcase },
      { value: 'service_mgr', label: 'Service Manager',  icon: FiBriefcase },
    ],
  };

  const paceOptions = [
    { value: '10-15min', label: '10–15 minutes',  icon: FiClock },
    { value: '20-30min', label: '20–30 minutes',  icon: FiClock },
    { value: '30-45min', label: '30–45 minutes',  icon: FiClock },
    { value: 'weekend',  label: 'Weekends only',  icon: FiClock },
  ];

  // ── Step labels for sidebar dots ────────────────────────────────────────────
  const stepLabels = ['Welcome', 'Language', 'Background', 'Goal', 'Industry', 'Role', 'Pace', 'Done'];

  return (
    <div className="ob-shell">

      {/* ── Left: Form Panel ──────────────────────────────────────────────── */}
      <div className="ob-form-panel">

        {/* Brand */}
        <div className="ob-brand">
          <div className="ob-brand-icon"><FiAward size={18} /></div>
          <span className="ob-brand-name">CareerKraft</span>
        </div>

        {/* Progress */}
        <div className="ob-progress-wrap">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="fw-semibold text-primary">Step {step + 1} of 8</small>
            <small className="text-muted">{stepLabels[step]}</small>
          </div>
          <div className="ob-step-dots">
            {[0,1,2,3,4,5,6,7].map((s) => (
              <div
                key={s}
                className={`ob-dot ${s < step ? 'ob-dot--done' : ''} ${s === step ? 'ob-dot--active' : ''}`}
              >
                {s < step ? <FiCheck size={11} /> : s + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="ob-step-content">

          {step === 0 && (
            <div>
              <h4 className="ob-step-title">Welcome to CareerKraft!</h4>
              <p className="ob-step-sub">Let's personalise your learning journey in a few quick steps.</p>
              <div className="ob-welcome-box">
                <p className="mb-2"><strong>Meet Ria</strong> — Your Personal AI Career Coach</p>
                <p className="text-muted small mb-0">
                  Ria guides you through personalised learning modules, helps you practice real-world scenarios, and tracks your progress toward your career goals.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiGlobe className="text-primary" /> Preferred Language
              </h5>
              <p className="ob-step-sub">Select one or more languages</p>
              <div className="d-flex flex-column gap-2">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिन्दी (Hindi)' },
                  { value: 'mr', label: 'मराठी (Marathi)' },
                  { value: 'ta', label: 'தமிழ் (Tamil)' },
                ].map((lang) => (
                  <Form.Check
                    key={lang.value}
                    type="checkbox"
                    id={`lang-${lang.value}`}
                    label={lang.label}
                    checked={formData.preferred_languages.includes(lang.value)}
                    onChange={() => handleLanguageToggle(lang.value)}
                    className="language-checkbox"
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiTrendingUp className="text-primary" /> Your Background
              </h5>
              <p className="ob-step-sub">Help us understand where you are</p>
              <div className="option-grid">
                {userTypeOptions.map((o) => (
                  <OptionTile key={o.value} label={o.label} icon={o.icon}
                    isSelected={formData.user_type === o.value}
                    onClick={() => handleChange('user_type', o.value)} fullWidth />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiTarget className="text-primary" /> Learning Goal
              </h5>
              <p className="ob-step-sub">What do you want to achieve?</p>
              <div className="option-grid">
                {goalOptions.map((o) => (
                  <OptionTile key={o.value} label={o.label} icon={o.icon}
                    isSelected={formData.goal === o.value}
                    onClick={() => handleChange('goal', o.value)} fullWidth />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiGlobe className="text-primary" /> Industry / Sector
              </h5>
              <p className="ob-step-sub">Which industry matches your goals?</p>
              <div className="option-grid">
                {industryOptions.map((o) => (
                  <OptionTile key={o.value} label={o.label} icon={o.icon}
                    isSelected={formData.industry === o.value}
                    onClick={() => handleChange('industry', o.value)} fullWidth />
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiBriefcase className="text-primary" /> Target Role
              </h5>
              <p className="ob-step-sub">Select a role within your chosen industry</p>
              <div className="option-grid">
                {(roleOptions[formData.industry] || []).map((o) => (
                  <OptionTile key={o.value} label={o.label} icon={o.icon}
                    isSelected={formData.target_role === o.value}
                    onClick={() => handleChange('target_role', o.value)} fullWidth />
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h5 className="ob-step-title d-flex align-items-center gap-2">
                <FiClock className="text-primary" /> Learning Pace
              </h5>
              <p className="ob-step-sub">How much time can you dedicate daily?</p>
              <div className="option-grid">
                {paceOptions.map((o) => (
                  <OptionTile key={o.value} label={o.label} icon={o.icon}
                    isSelected={formData.learning_pace === o.value}
                    onClick={() => handleChange('learning_pace', o.value)} fullWidth />
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="text-center">
              <div className="ob-done-icon">✓</div>
              <h4 className="ob-step-title">Your Learning Path is Ready!</h4>
              <div className="ob-welcome-box border-success">
                <p className="mb-2">Based on your selections we've created a personalised learning journey.</p>
                <p className="text-muted small mb-2">
                  Industry: <strong>{formData.industry?.toUpperCase() || '—'}</strong> &nbsp;|&nbsp;
                  Role: <strong>{formData.target_role || '—'}</strong>
                </p>
                <p className="text-muted small mb-0">
                  Complete your profile to gain visibility to potential employers.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="ob-alert">
            {error}
          </Alert>
        )}

        {/* Navigation */}
        <div className="ob-nav">
          <Button
            variant="outline-primary"
            className="ob-btn-back"
            onClick={handlePrev}
            disabled={step === 0}
          >
            <FiArrowLeft size={16} /> Back
          </Button>

          {step < 7 ? (
            <Button variant="primary" className="ob-btn-next" onClick={handleNext}>
              Next <FiArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="warning" className="ob-btn-next text-white" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Starting…</>
                : <><FiArrowRight size={16} /> Start Learning</>}
            </Button>
          )}
        </div>

      </div>

      {/* ── Right: Image / Illustration Panel (hidden on mobile) ──────────── */}
      <div className="ob-image-panel d-none d-md-flex">
        <div className="ob-image-inner">
          {/* Placeholder illustration */}
          <div className="ob-illustration">
            <div className="ob-illus-circle ob-illus-circle--lg" />
            <div className="ob-illus-circle ob-illus-circle--md" />
            <div className="ob-illus-circle ob-illus-circle--sm" />
            <div className="ob-illus-icon">
              <FiAward size={64} />
            </div>
          </div>

          <div className="ob-image-text">
            <h2>Skill. Practice. Grow.</h2>
            <p>Join thousands of professionals mastering real-world skills through AI-powered roleplay coaching.</p>
            <div className="ob-feature-list">
              <div className="ob-feature"><FiCheck size={14} /> Personalised learning path</div>
              <div className="ob-feature"><FiCheck size={14} /> AI roleplay with live feedback</div>
              <div className="ob-feature"><FiCheck size={14} /> Industry-ready skill modules</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
