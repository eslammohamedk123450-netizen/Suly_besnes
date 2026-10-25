import React from 'react';

interface SulyLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SulyLogo: React.FC<SulyLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-2xl shadow-lg shadow-emerald-950/40 border border-emerald-500/30 overflow-hidden"
        style={{ width: size, height: size, backgroundColor: '#102a43' }}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42 65c0-12 10-22 22-22h32c12 0 22 10 22 22v43c0 6-5 11-11 11H53c-6 0-11-5-11-11V65Z"
            fill="#2f855a"
          />
          <path
            d="M55 67c0-14 11-25 25-25s25 11 25 25"
            stroke="#d9f99d"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M91 77c-3-4-8-6-14-6-8 0-13 4-13 9 0 14 28 7 28 22 0 6-6 10-15 10-7 0-13-2-17-7"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent">
              سولي بزنس
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Pro
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            Suly Business Platform
          </span>
        </div>
      )}
    </div>
  );
};
