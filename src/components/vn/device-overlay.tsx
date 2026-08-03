'use client';

import { useState, useEffect } from 'react';
import type { VNOverlay } from '@/lib/schema/case.schema';

interface DeviceOverlayProps {
  overlay: NonNullable<VNOverlay>;
  onDismiss: () => void;
}

/**
 * Renders a phone-like overlay for notifications, Messenger, Facebook, or TikTok content.
 * Mimics the "notification sound → phone screen" beat from the pitch video.
 */
export function DeviceOverlay({ overlay, onDismiss }: DeviceOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Stagger the entrance: brief delay for "notification sound" feel
    const showTimer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(showTimer);
  }, []);

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(onDismiss, 400);
  };

  if (!visible && !dismissing) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-storm-bg">
        <div className="text-storm-dim text-sm animate-pulse">...</div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
        dismissing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleDismiss}
    >
      {/* Phone frame */}
      <div
        className={`w-72 sm:w-80 rounded-[2rem] border-2 p-3 shadow-2xl transition-all duration-500 ${
          visible && !dismissing ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          background: '#1C1916',
          borderColor: '#6B6358',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-2 py-1 text-xs text-storm-muted">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 rounded-sm border border-storm-muted" />
            <div className="w-3.5 h-2 rounded-sm border border-storm-muted" />
          </div>
        </div>

        {/* Content by type */}
        <div className="mt-2">
          {overlay.type === 'notification' && (
            <NotificationContent sender={overlay.sender} text={overlay.text} />
          )}
          {overlay.type === 'messenger' && (
            <MessengerContent sender={overlay.sender} text={overlay.text} />
          )}
          {(overlay.type === 'facebook' || overlay.type === 'tiktok') && (
            <SocialContent type={overlay.type} sender={overlay.sender} text={overlay.text} />
          )}
        </div>

        {/* Dismiss hint */}
        <div className="mt-4 text-center">
          <span className="text-storm-dim text-xs opacity-60">Tap anywhere to continue</span>
        </div>
      </div>
    </div>
  );
}

function NotificationContent({ sender, text }: { sender?: string; text?: string }) {
  return (
    <div className="p-4 space-y-3">
      {/* App icon row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-storm-accent flex items-center justify-center text-storm-bg text-xs font-bold">
          M
        </div>
        <div>
          <div className="text-storm-text text-sm font-semibold">Messages</div>
          <div className="text-storm-dim text-xs">now</div>
        </div>
      </div>
      {/* Notification content */}
      <div className="bg-storm-raised rounded-xl p-3 animate-slide-up">
        <div className="text-storm-accent text-xs font-bold mb-1">{sender}</div>
        <div className="text-storm-text text-sm">{text}</div>
      </div>
    </div>
  );
}

function MessengerContent({ sender, text }: { sender?: string; text?: string }) {
  return (
    <div className="p-4">
      {/* Chat header */}
      <div className="flex items-center gap-2 pb-3 border-b border-storm-dim/20 mb-3">
        <div className="w-7 h-7 rounded-full bg-storm-accent flex items-center justify-center text-storm-bg text-xs font-bold">
          {sender?.[0] ?? '?'}
        </div>
        <span className="text-storm-text text-sm font-semibold">{sender ?? 'Message'}</span>
      </div>
      {/* Message bubble */}
      <div className="flex justify-start">
        <div
          className="max-w-[80%] rounded-2xl rounded-bl-sm p-3 text-sm"
          style={{ background: '#28231D' }}
        >
          <div className="text-storm-text">{text}</div>
        </div>
      </div>
    </div>
  );
}

function SocialContent({ type, sender, text }: { type: string; sender?: string; text?: string }) {
  const platform = type === 'tiktok' ? 'TikTok' : 'Facebook';
  const bgColor = type === 'tiktok' ? '#121212' : '#1877F2';

  return (
    <div className="p-4">
      {/* Platform header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {platform[0]}
        </div>
        <span className="text-storm-muted text-xs">{platform} Feed</span>
      </div>
      {/* Post card */}
      <div className="rounded-xl overflow-hidden border border-storm-dim/20">
        <div className="p-3" style={{ background: '#28231D' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-storm-dim" />
            <div>
              <div className="text-storm-text text-xs font-semibold">{sender ?? 'User'}</div>
              <div className="text-storm-dim text-[10px]">Just now</div>
            </div>
          </div>
          <div className="text-storm-text text-sm mb-2">{text}</div>
          {/* Image placeholder */}
          <div
            className="w-full h-32 rounded-lg flex items-center justify-center text-storm-dim text-xs"
            style={{ background: '#1C1916' }}
          >
            [Media]
          </div>
        </div>
      </div>
    </div>
  );
}
