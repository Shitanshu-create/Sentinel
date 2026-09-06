import React from 'react';

const STEPS = [
  { number: 1, title: 'Personal' },
  { number: 2, title: 'Service' },
  { number: 3, title: 'Status' },
  { number: 4, title: 'Account' }
];

export function StepIndicator({ currentStep, setStep }) {
  return (
    <div className="auth-step-indicator-wrapper">
      <div className="auth-step-progress-bar">
        <div 
          className="auth-step-progress-fill" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <div className="auth-step-items">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          return (
            <button
              key={step.number}
              type="button"
              onClick={() => {
                if (step.number < currentStep) {
                  setStep(step.number);
                }
              }}
              disabled={step.number > currentStep}
              className={`auth-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="auth-step-circle">
                {isCompleted ? '✓' : step.number}
              </div>
              <span className="auth-step-label">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
