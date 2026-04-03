"use client";

import { useState } from "react";

export function Banner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative border-b border-shade-border bg-shade-surface/50 px-4 py-2">
      <p className="text-xs text-shade-muted text-center max-w-2xl mx-auto pr-6">
        <strong className="text-shade-text">Early Preview</strong> — This
        system is for testing only and not suitable for large amounts. The
        anonymity set is currently too small to provide real privacy, and the
        protocol has not been audited by external organizations.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-shade-muted hover:text-shade-text transition-colors"
        aria-label="Close banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
