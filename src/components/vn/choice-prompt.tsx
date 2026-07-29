'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { VNChoice, Decision } from '@/lib/schema/case.schema';

interface ChoicePromptProps {
  choices: VNChoice[];
  decisions: Decision[];
  onChoose: (choiceId: string) => void;
}

const CHOICE_STYLES: Record<string, { label: string; color: string; activeBg: string }> = {
  share: { label: 'SHARE', color: '#C4863A', activeBg: 'rgba(196,134,58,0.15)' },
  verify: { label: 'VERIFY', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.15)' },
  ignore: { label: 'IGNORE', color: '#8C2E2E', activeBg: 'rgba(140,46,46,0.15)' },
  act: { label: 'ACT', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.15)' },
  dismiss: { label: 'DISMISS', color: '#8C2E2E', activeBg: 'rgba(140,46,46,0.15)' },
  wait: { label: 'WAIT', color: '#6B6358', activeBg: 'rgba(107,99,88,0.15)' },
  correct: { label: 'CORRECT', color: '#D49A44', activeBg: 'rgba(212,154,68,0.15)' },
  educate: { label: 'EDUCATE', color: '#D49A44', activeBg: 'rgba(212,154,68,0.15)' },
  clear_summary: { label: 'CLEAR', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.15)' },
  urgent_summary: { label: 'URGENT', color: '#C4863A', activeBg: 'rgba(196,134,58,0.15)' },
  brief_summary: { label: 'BRIEF', color: '#6B6358', activeBg: 'rgba(107,99,88,0.15)' },
};

export function ChoicePrompt({ choices, decisions, onChoose }: ChoicePromptProps) {
  const [visible, setVisible] = useState(false);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const chosenRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const c of choices) {
      if (c.timerSeconds) {
        initial[c.id] = c.timerSeconds;
      }
    }
    if (Object.keys(initial).length > 0) {
      setTimers(initial);
    }
  }, [choices]);

  useEffect(() => {
    for (const c of choices) {
      if (c.timerSeconds && timers[c.id] !== undefined) {
        const id = setInterval(() => {
          setTimers((prev) => {
            const current = prev[c.id];
            if (current === undefined || current <= 1) {
              clearInterval(id);
              if (!chosenRef.current) {
                chosenRef.current = true;
                onChoose(c.id);
              }
              return prev;
            }
            return { ...prev, [c.id]: current - 1 };
          });
        }, 1000);
        intervalsRef.current[c.id] = id;
      }
    }

    return () => {
      for (const id of Object.values(intervalsRef.current)) {
        clearInterval(id);
      }
      intervalsRef.current = {};
    };
  }, [choices, onChoose]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      if (chosenRef.current) return;
      chosenRef.current = true;
      onChoose(choiceId);
    },
    [onChoose],
  );

  const decisionMap = useRef<Record<string, Decision>>({});
  decisionMap.current = {};
  for (const d of decisions) {
    decisionMap.current[d.id] = d;
  }

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Choice cards */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8 flex flex-col gap-3 sm:gap-4">
        {choices.map((choice, index) => {
          const decision = decisionMap.current[choice.id];
          const style = CHOICE_STYLES[choice.id] ?? {
            label: choice.label,
            color: '#9A9284',
            activeBg: 'rgba(154,146,132,0.15)',
          };
          const timer = choice.timerSeconds ? timers[choice.id] : undefined;
          const description = decision?.label ?? choice.label;

          return (
            <button
              key={choice.id}
              onClick={() => handleChoose(choice.id)}
              className={`
                relative group rounded-xl border px-5 py-4 text-left
                transition-all duration-300
                hover:scale-[1.03] active:scale-[0.97]
                ${visible ? 'translate-y-0' : 'translate-y-4'}
              `}
              style={{
                borderColor: `${style.color}33`,
                background: `linear-gradient(135deg, ${style.activeBg} 0%, rgba(13,12,10,0.6) 100%)`,
                transitionDelay: `${index * 80}ms`,
              }}
            >
              {/* Timer ring */}
              {timer !== undefined && (
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-storm-bg border-2 flex items-center justify-center z-10"
                  style={{ borderColor: style.color }}
                >
                  <span
                    className="text-sm font-bold animate-countdown-pulse"
                    style={{ color: style.color }}
                  >
                    {timer}
                  </span>
                </div>
              )}

              {/* Card accent bar */}
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                style={{ background: style.color }}
              />

              <div className="pl-4">
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: style.color }}
                >
                  {style.label}
                </div>
                <div className="text-storm-text text-sm sm:text-base leading-relaxed">
                  {description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
