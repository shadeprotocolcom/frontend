"use client";

export type Tab = "shield" | "balance" | "send" | "unshield";

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "shield", label: "Shield" },
  { id: "balance", label: "Balance" },
  { id: "send", label: "Send" },
  { id: "unshield", label: "Unshield" },
];

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="flex gap-1 rounded-xl bg-shade-bg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-shade-surface text-white shadow-sm"
              : "text-shade-muted hover:text-shade-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
