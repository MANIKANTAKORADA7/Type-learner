import React, { useState } from 'react';
import { type UserProfile, saveProfile } from '../utils/db';

interface OnboardingProps {
  profile: UserProfile;
  onOnboardingComplete: (updatedProfile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  profile,
  onOnboardingComplete
}) => {
  const [step, setStep] = useState(1);

  // States for user onboarding choices
  const [typingLevel, setTypingLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState('Improve Accuracy');
  const [language, setLanguage] = useState('EN');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(20);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      typingLevel,
      goal,
      language,
      dailyGoalMinutes,
      // Clear flag or set onboarding completed
      level: 1, // initialize
      xp: 0
    };
    saveProfile(updatedProfile);
    onOnboardingComplete(updatedProfile);
  };

  const progressPercent = (step / totalSteps) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInUpScale 0.3s ease' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '32px' }}>🎯</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                What is your typing experience?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                We'll tailor your roadmap and practice exercises accordingly.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { value: 'beginner', label: 'Beginner', desc: 'I type slowly or look at the keyboard', emoji: '🌱' },
                { value: 'intermediate', label: 'Intermediate', desc: 'I know core keys but want to increase speed', emoji: '🚀' },
                { value: 'advanced', label: 'Advanced', desc: 'I can touch type and want to master extreme accuracy', emoji: '👑' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTypingLevel(opt.value as any)}
                  style={{
                    background: typingLevel === opt.value ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: typingLevel === opt.value ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="hover-glow"
                >
                  <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '14px', color: typingLevel === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.label}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInUpScale 0.3s ease' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '32px' }}>🏆</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                What is your main goal?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Choose the objective you'd like to work on first.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'Improve Accuracy', desc: 'Focus on perfect key hits', emoji: '🎯' },
                { value: 'Increase Speed', desc: 'Reach higher WPM rates', emoji: '⚡' },
                { value: 'Learn Touch Typing', desc: 'Type without looking', emoji: '⌨️' },
                { value: 'Coding Practice', desc: 'Symbols and code brackets', emoji: '💻' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoal(opt.value)}
                  style={{
                    background: goal === opt.value ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: goal === opt.value ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 12px',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="hover-glow"
                >
                  <span style={{ fontSize: '28px' }}>{opt.emoji}</span>
                  <strong style={{ fontSize: '13px', color: goal === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.value}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInUpScale 0.3s ease' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '32px' }}>🗣️</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                Preferred language?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Roadmap texts and user guides will be set in this language.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { code: 'EN', name: 'English (US & UK)', desc: 'Standard QWERTY vocabulary practice', flag: '🇺🇸' },
                { code: 'ES', name: 'Español (Spanish)', desc: 'Practicar palabras acentuadas y eñes', flag: '🇪🇸' },
                { code: 'FR', name: 'Français (French)', desc: 'AZERTY layouts y acentos franceses', flag: '🇫🇷' },
                { code: 'DE', name: 'Deutsch (German)', desc: 'QWERTZ layouts y diéresis alemanas', flag: '🇩🇪' }
              ].map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  style={{
                    background: language === opt.code ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: language === opt.code ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="hover-glow"
                >
                  <span style={{ fontSize: '24px' }}>{opt.flag}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '14px', color: language === opt.code ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInUpScale 0.3s ease' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '32px' }}>⏱️</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                Set your daily goal
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                How much time do you want to invest in typing practice each day?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 10, label: 'Casual', emoji: '☕' },
                { value: 20, label: 'Regular', emoji: '🛹' },
                { value: 30, label: 'Intense', emoji: '🏋️' },
                { value: 60, label: 'Extreme', emoji: '⚡' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDailyGoalMinutes(opt.value)}
                  style={{
                    background: dailyGoalMinutes === opt.value ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: dailyGoalMinutes === opt.value ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 12px',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="hover-glow"
                >
                  <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                  <strong style={{ fontSize: '14px', color: dailyGoalMinutes === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.value} Minutes</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.label} practice / day</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      
      {/* Step Header */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
        <span>ONBOARDING PROFILE SETUP</span>
        <span>STEP {step} OF {totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px', width: '100%', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'var(--primary)',
          transition: 'width 0.4s ease',
          borderRadius: '2px'
        }}></div>
      </div>

      {/* Main card box content */}
      <div className="card-glass" style={{
        padding: '35px 25px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px'
      }}>
        {renderStepContent()}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="btn-secondary"
          style={{
            flex: 1,
            justifyContent: 'center',
            height: '42px',
            opacity: step === 1 ? 0.3 : 1,
            cursor: step === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          className="btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            height: '42px'
          }}
        >
          {step === totalSteps ? "🏁 Finish Setup" : "Continue →"}
        </button>
      </div>

    </div>
  );
};
