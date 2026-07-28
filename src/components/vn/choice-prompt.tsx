'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { VNChoice } from '@/lib/schema/case.schema';

interface ChoicePromptProps {
  choices: VNChoice[];
  onChoose: (choiceId: string) => void;
}

/**
 * Timed choice prompt for the VN.
 * Shows SHARE / VERIFY / IGNORE buttons with optional countdown.
 * Based on the behavioral framework from the pitch video.
 */
const CHOICE_STYLES: Record<string, { label: string; color: string; activeBg: string }> = {
  share: { label: 'SHARE', color: '#C4863A', activeBg: 'rgba(196,134,58,0.2)' },
  verify: { label: 'VERIFY', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.2)' },
  ignore: { label: 'IGNORE', color: '#8C2E2E', activeBg: 'rgba(140,46,46,0.2)' },
  act: { label: 'ACT', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.2)' },
  dismiss: { label: 'DISMISS', color: '#8C2E2E', activeBg: 'rgba(140,46,46,0.2)' },
  wait: { label: 'WAIT', color: '#6B6358', activeBg: 'rgba(107,99,88,0.2)' },
  correct: { label: 'CORRECT', color: '#D49A44', activeBg: 'rgba(212,154,68,0.2)' },
  educate: { label: 'EDUCATE', color: '#D49A44', activeBg: 'rgba(212,154,68,0.2)' },
  clear_summary: { label: 'CLEAR', color: '#4A7C5C', activeBg: 'rgba(74,124,92,0.2)' },
  urgent_summary: { label: 'URGENT', color: '#C4863A', activeBg: 'rgba(196,134,58,0.2)' },
  brief_summary: { label: 'BRIEF', color: '#6B6358', activeBg: 'rgba(107,99,88,0.2)' },
};

export function ChoicePrompt({ choices, onChoose }: ChoicePromptProps) {
  const [visible, setVisible] = useState(false);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const chosenRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Initialize timers
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

  // Countdown logic
  useEffect(() => {
    for (const c of choices) {
      if (c.timerSeconds && timers[c.id] !== undefined) {
        const id = setInterval(() => {
          setTimers((prev) => {
            const current = prev[c.id];
            if (current === undefined || current <= 1) {
              clearInterval(id);
              // Auto-select when timer expires
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      if (chosenRef.current) return;
      chosenRef.current = true;
      onChoose(choiceId);
    },
    [onChoose],
  );

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Gradient fade above choices */}
      <div
        className="h-16 w-full"
        style={{
          background: 'linear-gradient(to top, rgba(13,12,10,0.95) 0%, transparent 100%)',
        }}
      />

      {/* Choice buttons */}
      <div
        className="px-4 pb-6 sm:pb-8"
        style={{ background: 'rgba(13,12,10,0.95)' }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {choices.map((choice) => {
            const style = CHOICE_STYLES[choice.id] ?? {
              label: choice.label,
              color: '#9A9284',
              activeBg: 'rgba(154,146,132,0.2)',
            };
            const timer = choice.timerSeconds ? timers[choice.id] : undefined;

            return (
              <button
                key={choice.id}
                onClick={() => handleChoose(choice.id)}
                className="relative group rounded-xl border px-4 py-3 sm:py-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  borderColor: `${style.color}44`,
                  background: style.activeBg,
                }}
              >
                {/* Timer ring */}
                {timer !== undefined && (
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-storm-bg border-2 flex items-center justify-center"
                    style={{ borderColor: style.color }}
                  >
                    <span
                      className="text-xs font-bold animate-countdown-pulse"
                      style={{ color: style.color }}
                    >
                      {timer}
                    </span>
                  </div>
                )}

                <div
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: style.color }}
                >
                  {style.label}
                </div>
                <div className="text-storm-muted text-xs mt-0.5">
                  {choice.label.replace(style.label, '').trim() || 'Choose'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
