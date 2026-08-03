'use client';

import { useState, useEffect, useRef } from 'react';

interface TextBoxProps {
  speaker?: string;
  text?: string;
  onComplete?: () => void;
  /** Characters per second for the typewriter effect. */
  speed?: number;
}

/**
 * Bottom-aligned VN text box with typewriter effect.
 * Shows speaker name and slowly reveals dialog text character by character.
 */
export function TextBox({ speaker, text, onComplete, speed = 40 }: TextBoxProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reset when text changes
    setDisplayed('');
    setIsComplete(false);
    indexRef.current = 0;

    if (!text) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  if (!text) return null;

  // Allow skipping to end on click
  const handleClick = () => {
    if (!isComplete) {
      setDisplayed(text);
      setIsComplete(true);
      indexRef.current = text.length;
      onCompleteRef.current?.();
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4 pb-8 sm:p-6 sm:pb-10 cursor-pointer animate-slide-up"
      onClick={handleClick}
    >
      <div
        className="max-w-3xl mx-auto rounded-xl p-4 sm:p-6 border border-storm-dim/20"
        style={{
          background: 'linear-gradient(180deg, rgba(28,25,22,0.95) 0%, rgba(13,12,10,0.98) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {speaker && (
          <div className="text-storm-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
            {speaker}
          </div>
        )}
        <div className="text-storm-text text-sm sm:text-base leading-relaxed min-h-[3em]">
          {displayed}
          {!isComplete && (
            <span className="inline-block w-0.5 h-4 bg-storm-accent ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
