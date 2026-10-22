import type { ReactNode } from 'react';

export type IconName =
  | 'home' | 'gavel' | 'company' | 'investment' | 'land' | 'factory'
  | 'warehouse' | 'report' | 'tasks' | 'settings' | 'gold' | 'bank'
  | 'crown' | 'arrow' | 'chevron' | 'close' | 'play' | 'shield'
  | 'briefcase' | 'menu' | 'clock' | 'lock' | 'plus' | 'globe' | 'target';

const drawings: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
  gavel: <><path d="m14 5 5 5M12 7l5-5 6 6-5 5M9 10l5 5M7 12l5 5-4 4-5-5zM3 21h18"/></>,
  company: <><path d="M4 21V5l8-3v19M12 9h8v12M2 21h20"/><path d="M7 7h2m-2 4h2m-2 4h2m7-2h2m-2 4h2"/></>,
  investment: <><path d="M3 20h18M5 16l5-5 4 3 6-8"/><path d="M15 6h5v5"/></>,
  land: <><path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3z"/><path d="M9 4v13m6-10v13"/></>,
  factory: <><path d="M3 21V9l6 4V9l6 4V6h6v15z"/><path d="M17 10h1m-1 4h1M7 17h1m4 0h1m4 0h1"/></>,
  warehouse: <><path d="m3 10 9-7 9 7v11H3z"/><path d="M7 21v-7h10v7M8 9h.01M12 9h.01M16 9h.01"/></>,
  report: <><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8m-8 4h8"/></>,
  tasks: <><rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 4V2h6v2M8 11l2 2 5-5m-7 9h8"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.8.6l-.1.2h-3.6l-.1-.2a1.7 1.7 0 0 0-1.8-.6l-.2.1-1.8-3.1.1-.1A1.7 1.7 0 0 0 8.8 15l-.2-.1v-3.7l.2-.1a1.7 1.7 0 0 0 .6-1.8l-.1-.2 1.8-3.1.2.1a1.7 1.7 0 0 0 1.8-.6l.1-.2h3.6l.1.2a1.7 1.7 0 0 0 1.8.6l.2-.1 1.8 3.1-.1.2a1.7 1.7 0 0 0 .6 1.8l.2.1v3.7z" transform="translate(-2 -2) scale(1.17)"/></>,
  gold: <><path d="M12 3v18M5 7h14M7 7l-4 7h8zm10 0-4 7h8zM8 21h8"/></>,
  bank: <><path d="m3 9 9-6 9 6M4 10h16M5 20h14M7 10v8m5-8v8m5-8v8M3 21h18"/></>,
  crown: <><path d="m3 8 5 4 4-7 4 7 5-4-2 11H5z"/><path d="M7 22h10"/></>,
  arrow: <><path d="M19 12H5m7 7-7-7 7-7"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  play: <path d="m8 5 11 7-11 7z"/>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11"/><path d="m9 12 2 2 4-4"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18m-11 0v2h4v-2"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/></>,
  target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></>,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[name]}
    </svg>
  );
}
