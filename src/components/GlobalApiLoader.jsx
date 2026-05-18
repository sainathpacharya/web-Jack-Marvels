import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { subscribeGlobalApiLoading } from '../lib/globalApiLoadingBus';

/**
 * Full-screen overlay while any `apiClient` request is in flight.
 * Blocks pointer interaction to prevent duplicate submits until success or error.
 */
export default function GlobalApiLoader() {
  const [pending, setPending] = useState(0);
  const active = pending > 0;

  useEffect(() => subscribeGlobalApiLoading(setPending), []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    const body = document.body;
    if (active) {
      root.setAttribute('data-api-loading', 'true');
      const prevOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => {
        root.removeAttribute('data-api-loading');
        body.style.overflow = prevOverflow;
      };
    }
    root.removeAttribute('data-api-loading');
    return undefined;
  }, [active]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
      role="alertdialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]" />
      <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/30 bg-white/95 px-10 py-8 shadow-xl">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-700">Please wait…</p>
      </div>
    </div>,
    document.body,
  );
}
