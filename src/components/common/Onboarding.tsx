// @ts-nocheck
import { type Language, translations } from "@/i18n/translations";
// Onboarding Component - First-time user guide
import { useState } from "react";
import "./Onboarding.css";

interface Props {
  onComplete: () => void;
  initialLang?: Language;
}

export function Onboarding({ onComplete, initialLang = "en" }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = translations[initialLang];

  const steps = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
          />
        </svg>
      ),
      title: t.onboarding.step1Title,
      description: t.onboarding.step1Desc,
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: t.onboarding.step2Title,
      description: t.onboarding.step2Desc,
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: t.onboarding.step3Title,
      description: t.onboarding.step3Desc,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("chinaconnect_onboarding_complete", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <button className="onboarding-skip" onClick={handleSkip}>
            {t.onboarding.skip}
          </button>
        </div>

        <div className="onboarding-content">
          <div className="onboarding-step-icon">{steps[currentStep].icon}</div>
          <h2 className="onboarding-step-title">{steps[currentStep].title}</h2>
          <p className="onboarding-step-desc">{steps[currentStep].description}</p>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-dots">
            {steps.map((_, index) => (
              <button
                key={index}
                class={`onboarding-dot ${index === currentStep ? "active" : ""}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button className="onboarding-next" onClick={handleNext}>
            {currentStep === steps.length - 1 ? t.onboarding.getStarted : t.onboarding.next}
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
