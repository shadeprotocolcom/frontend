"use client";

interface TxLinkProps {
  hash: string;
}

export function TxLink({ hash }: TxLinkProps) {
  const shortHash = `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  const url = `https://citreascan.com/tx/${hash}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-sm text-shade-green hover:underline"
    >
      {shortHash}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
