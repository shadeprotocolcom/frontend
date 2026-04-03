"use client";

import { ConnectKitButton } from "connectkit";

export function Header() {
  return (
    <header className="border-b border-shade-border">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shade-green/10">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16M8 10V14M16 10V14"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Shade Protocol
          </span>
        </div>
        <ConnectKitButton />
      </div>
    </header>
  );
}
