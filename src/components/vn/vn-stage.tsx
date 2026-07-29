'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSimulation } from '@/lib/engine/simulation-context';
import { Background } from './background';
import { CharacterSprite } from './character-sprite';
import { TextBox } from './text-box';
import { DeviceOverlay } from './device-overlay';
import { ChoicePrompt } from './choice-prompt';

type StagePhase = 'overlay' | 'typing' | 'choices' | 'transitioning';

/**
 * Main Visual Novel stage component.
 * Orchestrates the scene flow: Overlay → Typing → Choices → Transition.
 */
export function VNStage() {
  const { currentNode, makeDecision, completed, profile, reset, init, phase, caseId } = useSimulation();
  const [stagePhase, setStagePhase] = useState<StagePhase>('overlay');
  const [transitionOut, setTransitionOut] = useState(false);
  const nodeRef = useRef(currentNode);

  /**
   * When the node changes (new scene after a decision), do a fade-out
   * then set the correct starting phase based on what the node has:
   *   overlay → 'overlay' (notification/social screen)
   *   text    → 'typing' (dialog box)
   *   neither → 'choices' (immediate choice prompt)
   */
  useEffect(() => {
    if (currentNode !== nodeRef.current) {
      setTransitionOut(true);
      const timer = setTimeout(() => {
        nodeRef.current = currentNode;
        setTransitionOut(false);
        if (currentNode?.overlay) {
          setStagePhase('overlay');
        } else if (currentNode?.text) {
          setStagePhase('typing');
        } else {
          setStagePhase('choices');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentNode]);

  // On first render, skip the 'overlay' phase if the entry node has no overlay
  useEffect(() => {
    if (currentNode && !currentNode.overlay) {
      if (currentNode.text) {
        setStagePhase('typing');
      } else {
        setStagePhase('choices');
      }
    }
    // Only runs on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle overlay dismiss
  const handleOverlayDismiss = useCallback(() => {
    if (currentNode?.text) {
      setStagePhase('typing');
    } else if (currentNode?.vnChoices) {
      setStagePhase('choices');
    }
  }, [currentNode]);

  // Handle text completion
  const handleTextComplete = useCallback(() => {
    if (currentNode?.vnChoices) {
      setStagePhase('choices');
    }
  }, [currentNode]);

  // Handle choice made
  const handleChoice = useCallback(
    (choiceId: string) => {
      setStagePhase('transitioning');
      setTimeout(() => {
        makeDecision(choiceId);
      }, 300);
    },
    [makeDecision],
  );

  // Completed screen
  if (completed && profile) {
    return (
      <CompletionScreen
        profile={profile}
        onReplay={() => { reset(); }}
        caseId={caseId ?? ''}
      />
    );
  }

  // Loading state
  if (phase === 'loading' || !currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-storm-bg">
        <div className="text-storm-dim text-sm animate-pulse">Loading simulation...</div>
      </div>
    );
  }

  const hasOverlay = currentNode.overlay;
  const hasText = !!currentNode.text;
  const hasChoices = !!currentNode.vnChoices && currentNode.vnChoices.length > 0;
  const showChoices = stagePhase === 'choices' && hasChoices;
  const showOverlay = stagePhase === 'overlay' && hasOverlay;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-storm-bg">
      {/* Background layer */}
      <Background backgroundId={currentNode.background}>
        {/* Character sprite */}
        {!showOverlay && (
          <CharacterSprite
            spriteId={currentNode.sprite}
            speaker={currentNode.speaker}
          />
        )}
      </Background>

      {/* Transition overlay */}
      {transitionOut && (
        <div className="absolute inset-0 bg-storm-bg z-50 animate-fade-in" />
      )}

      {/* Device overlay (notification / messenger / social) */}
      {showOverlay && currentNode.overlay && (
        <DeviceOverlay
          overlay={currentNode.overlay}
          onDismiss={handleOverlayDismiss}
        />
      )}

      {/* Text box with typewriter */}
      {hasText && stagePhase !== 'overlay' && !transitionOut && (
        <TextBox
          speaker={currentNode.speaker}
          text={currentNode.text}
          onComplete={handleTextComplete}
        />
      )}

      {/* Choice prompt */}
      {showChoices && !transitionOut && (
        <ChoicePrompt
          choices={currentNode.vnChoices!}
          decisions={currentNode.decisions}
          onChoose={handleChoice}
        />
      )}
    </div>
  );
}

// ── Completion Screen ──

function CompletionScreen({
  profile,
  onReplay,
  caseId,
}: {
  profile: { id: string; title: string; description: string };
  onReplay: () => void;
  caseId: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-storm-bg p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="text-storm-accent text-xs uppercase tracking-widest font-bold">
          Simulation Complete
        </div>

        <div>
          <h2 className="text-2xl font-bold text-storm-text mb-2">
            {profile.title}
          </h2>
          <div
            className="w-16 h-1 mx-auto rounded-full mb-4"
            style={{ background: 'linear-gradient(90deg, #C4863A, #D49A44)' }}
          />
          <p className="text-storm-muted text-sm leading-relaxed">
            {profile.description}
          </p>
        </div>

        <div className="gradient-divider max-w-xs mx-auto" />

        {/* Links to debrief content */}
        <div className="flex flex-col gap-3">
          <p className="text-storm-dim text-xs">
            Your decisions shaped how information moved through your network
            during a real crisis.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/cases/${caseId}/evidence`}
              className="rounded-xl border border-storm-dim/25 p-4 text-left hover:border-storm-accent/50 transition-colors"
              style={{ background: 'rgba(28,25,22,0.5)' }}
            >
              <div className="text-storm-accent text-xs font-bold uppercase tracking-wider mb-1">
                Evidence
              </div>
              <div className="text-storm-dim text-xs">
                See what was real and what wasn&apos;t
              </div>
            </Link>

            <Link
              href={`/cases/${caseId}/debrief`}
              className="rounded-xl border border-storm-dim/25 p-4 text-left hover:border-storm-accent/50 transition-colors"
              style={{ background: 'rgba(28,25,22,0.5)' }}
            >
              <div className="text-storm-accent text-xs font-bold uppercase tracking-wider mb-1">
                Debrief
              </div>
              <div className="text-storm-dim text-xs">
                Context, toolkit &amp; profiles
              </div>
            </Link>
          </div>

          <button
            onClick={onReplay}
            className="inline-flex items-center justify-center gap-2 font-bold py-3 px-8 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #C4863A 0%, #D49A44 100%)',
              color: '#0D0C0A',
            }}
          >
            Replay Case
          </button>
        </div>
      </div>
    </div>
  );
}
