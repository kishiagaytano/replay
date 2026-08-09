'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSimulation } from '@/lib/engine/simulation-context';
import { Background } from './background';
import { CharacterSprite } from './character-sprite';
import { TextBox } from './text-box';
import { DeviceOverlay } from './device-overlay';
import { ChoicePrompt } from './choice-prompt';
import { MeterHUD } from './meter-hud';
import { LoopProgress, ContinueButton } from '@/components/loop/loop-nav';
import type { SimulationState } from '@/lib/engine/simulation-engine';

type StagePhase = 'overlay' | 'typing' | 'choices' | 'transitioning';

/**
 * Main Visual Novel stage component.
 * Orchestrates the scene flow: Overlay → Typing → Choices → Transition.
 */
export function VNStage() {
  const { currentNode, makeDecision, completed, profile, meters, reset, phase, caseId, engine } = useSimulation();
  const entryNodeId = engine?.getCaseInfo().entryNodeId;
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
    } else if (currentNode?.decisions.length) {
      setStagePhase('choices');
    }
  }, [currentNode]);

  // Handle text completion
  const handleTextComplete = useCallback(() => {
    if (currentNode?.decisions.length) {
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
        meters={meters}
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
  const hasChoices = currentNode.decisions.length > 0;
  const showChoices = stagePhase === 'choices' && hasChoices;
  const showOverlay = stagePhase === 'overlay' && hasOverlay;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-storm-bg">
      {/* Background layer */}
      <Background
        backgroundId={currentNode.background}
        priority={currentNode.id === entryNodeId}
      >
        {/* Character sprite */}
        {!showOverlay && (
          <CharacterSprite
            spriteId={currentNode.sprite}
            speaker={currentNode.speaker}
          />
        )}
      </Background>

      {/* Live learning indicators — §8 step 4 */}
      <MeterHUD meters={meters} />

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
  meters,
  onReplay,
  caseId,
}: {
  profile: { id: string; title: string; description: string };
  meters: SimulationState;
  onReplay: () => void;
  caseId: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-storm-bg p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <LoopProgress current="play" caseId={caseId} />

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

        <section className="text-left" aria-labelledby="final-indicators">
          <h3 id="final-indicators" className="text-storm-accent text-xs font-bold uppercase tracking-widest mb-3 text-center">
            Final Learning Indicators
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <MeterCard label="Community Trust" value={meters.communityTrust} color="#C4863A" />
            <MeterCard label="Information Integrity" value={meters.informationIntegrity} color="#4A7C5C" />
            <MeterCard label="Public Safety" value={meters.publicSafety} color="#D49A44" />
          </div>
        </section>

        <div className="gradient-divider max-w-xs mx-auto" />

        {/* The loop continues in sequence — reveal next, not a fork. */}
        <div className="flex flex-col gap-3">
          <p className="text-storm-dim text-xs">
            Your decisions shaped how information moved through your network
            during a real crisis. Next, see what actually happened.
          </p>

          <ContinueButton current="play" caseId={caseId} label="See what actually happened" />

          <button
            onClick={onReplay}
            className="text-storm-dim hover:text-storm-text text-xs underline underline-offset-4 transition-colors"
          >
            Replay the case instead
          </button>
        </div>
      </div>
    </div>
  );
}

function MeterCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-storm-dim/25 bg-storm-surface p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-storm-muted text-xs leading-tight">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-storm-bg" aria-label={`${label}: ${value} out of 100`}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <div className="mt-1 text-right text-[10px] uppercase tracking-wide text-storm-dim">out of 100</div>
    </div>
  );
}
