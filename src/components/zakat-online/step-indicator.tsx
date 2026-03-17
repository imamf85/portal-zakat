'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-[#599E6E] text-white'
                      : isActive
                      ? 'bg-[#599E6E] text-white ring-4 ring-[#599E6E]/20'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${
                    isActive || isCompleted ? 'text-[#599E6E]' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-4 rounded ${
                    isCompleted ? 'bg-[#599E6E]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Default steps for zakat online form
export const ZAKAT_FORM_STEPS: Step[] = [
  { number: 1, title: 'Data Muzakki' },
  { number: 2, title: 'Detail Zakat' },
  { number: 3, title: 'Niat & Review' },
  { number: 4, title: 'Pembayaran' },
];
