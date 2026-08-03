'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Decision } from '@/lib/schema/case.schema';

interface ChoicePromptProps {
  decisions: Decision[];
  onChoose: (choiceId: string) => void;
}

export function ChoicePrompt({ decisions, onChoose }: ChoicePromptProps) {
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
    for (const decision of decisions) {
      if (decision.timerSeconds) {
        initial[decision.id] = decision.timerSeconds;
      }
    }
    if (Object.keys(initial).length > 0) {
      setTimers(initial);
    }
  }, [decisions]);

  useEffect(() => {
    for (const decision of decisions) {
      if (decision.timerSeconds && timers[decision.id] !== undefined) {
        const id = setInterval(() => {
          setTimers((prev) => {
            const current = prev[decision.id];
            if (current === undefined || current <= 1) {
              clearInterval(id);
              if (!chosenRef.current) {
                chosenRef.current = true;
                onChoose(decision.id);
              }
              return prev;
            }
            return { ...prev, [decision.id]: current - 1 };
          });
        }, 1000);
        intervalsRef.current[decision.id] = id;
      }
    }

    return () => {
      for (const id of Object.values(intervalsRef.current)) {
        clearInterval(id);
      }
      intervalsRef.current = {};
    };
  }, [decisions, onChoose]);

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
      className={`absolute inset-x-0 top-0 z-40 mx-auto w-full max-w-xl px-4 pt-5 sm:px-6 sm:pt-8 transition-all duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Neutral, separate options stay above the dialogue so the question remains readable. */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {decisions.map((decision, index) => {
          const timer = decision.timerSeconds ? timers[decision.id] : undefined;

          return (
            <button
              key={decision.id}
              onClick={() => handleChoose(decision.id)}
              className={`
                relative rounded-xl border border-storm-text/35 bg-storm-bg/90 px-5 py-3 text-left shadow-lg backdrop-blur-sm
                transition-all duration-300
                hover:border-storm-text/70 hover:bg-storm-surface active:scale-[0.98]
                ${visible ? 'translate-y-0' : 'translate-y-4'}
              `}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Timer ring */}
              {timer !== undefined && (
                <div
                  className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-storm-text bg-storm-bg"
                >
                  <span className="animate-countdown-pulse text-sm font-bold text-storm-text">
                    {timer}
                  </span>
                </div>
              )}

              <div className="pr-5 text-storm-text text-sm leading-relaxed sm:text-base">
                {decision.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
