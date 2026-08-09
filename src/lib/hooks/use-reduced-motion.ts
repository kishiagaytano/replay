'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tracks `prefers-reduced-motion: reduce`.
 *
 * Uses `useSyncExternalStore` so the value is correct on the first client
 * render and stays correct if the user changes the setting mid-session,
 * without a setState-in-effect round trip. The server snapshot is `false`:
 * markup is identical either way, only motion differs.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const list = window.matchMedia(QUERY);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}
