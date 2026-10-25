import React from 'react';
import { getAvatarById } from '../domain/avatars';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';

interface AvatarPortraitProps {
  avatarId?: string | null;
  size?: AvatarSize;
  showBorder?: boolean;
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
  alt?: string;
}

const SIZE_MAP: Record<AvatarSize, { dimension: string; px: number; iconSize: string; crownSize: string }> = {
  xs: { dimension: 'w-7 h-7', px: 28, iconSize: 'text-[10px]', crownSize: 'w-3 h-3 text-[9px]' },
  sm: { dimension: 'w-9 h-9', px: 36, iconSize: 'text-xs', crownSize: 'w-3.5 h-3.5 text-[10px]' },
  md: { dimension: 'w-12 h-12', px: 48, iconSize: 'text-sm', crownSize: 'w-4 h-4 text-xs' },
  lg: { dimension: 'w-16 h-16', px: 64, iconSize: 'text-base', crownSize: 'w-5 h-5 text-sm' },
  xl: { dimension: 'w-24 h-24', px: 96, iconSize: 'text-xl', crownSize: 'w-6 h-6 text-base' },
  '2xl': { dimension: 'w-32 h-32', px: 128, iconSize: 'text-2xl', crownSize: 'w-8 h-8 text-lg' },
  hero: { dimension: 'w-40 h-40', px: 160, iconSize: 'text-3xl', crownSize: 'w-9 h-9 text-xl' },
};

export function AvatarPortrait({
  avatarId,
  size = 'md',
  showBorder = true,
  showBadge = false,
  className = '',
  onClick,
  alt,
}: AvatarPortraitProps) {
  const avatar = getAvatarById(avatarId);
  const sizeConfig = SIZE_MAP[size];

  const renderVisual = () => {
    switch (avatar.id) {
      case 'avatar_free_male_1':
        // Karim Al-Minshawi - Classic Charcoal Suit with Burgundy Silk Tie
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-fm1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a" />
                <stop offset="0.5" stopColor="#1e293b" />
                <stop offset="1" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="suit-fm1" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e293b" />
                <stop offset="1" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="tie-fm1" x1="45" y1="55" x2="55" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b91c1c" />
                <stop offset="1" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-fm1)" />
            {/* Ambient executive light */}
            <circle cx="50" cy="30" r="32" fill="#fbbf24" fillOpacity="0.12" />
            {/* Shoulders & Charcoal Suit */}
            <path d="M12 95 C12 70, 30 62, 50 62 C70 62, 88 70, 88 95 Z" fill="url(#suit-fm1)" />
            {/* White Dress Shirt V-neck */}
            <polygon points="42,62 58,62 54,82 50,86 46,82" fill="#f8fafc" />
            {/* Burgundy Tie */}
            <polygon points="48,64 52,64 54,82 50,92 46,82" fill="url(#tie-fm1)" />
            {/* Suit Lapels */}
            <polygon points="32,64 45,84 38,88 22,76" fill="#334155" />
            <polygon points="68,64 55,84 62,88 78,76" fill="#334155" />
            {/* Gold Lapel Pin */}
            <circle cx="34" cy="74" r="2.5" fill="#f59e0b" />
            {/* Neck */}
            <rect x="44" y="47" width="12" height="18" rx="4" fill="#f6d5b8" />
            {/* Head & Face */}
            <path d="M33 38 C33 24, 67 24, 67 38 C67 52, 58 58, 50 58 C42 58, 33 52, 33 38 Z" fill="#fed7aa" />
            {/* Stylish Classic Hair */}
            <path d="M31 35 C30 20, 42 14, 52 14 C62 14, 70 20, 69 32 C65 25, 52 24, 42 27 C36 29, 32 31, 31 35 Z" fill="#1c1917" />
            {/* Ears */}
            <circle cx="32" cy="39" r="4" fill="#fbcfe8" fillOpacity="0.4" />
            <circle cx="68" cy="39" r="4" fill="#fbcfe8" fillOpacity="0.4" />
            {/* Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#0f172a" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#0f172a" />
            {/* Eyebrows */}
            <path d="M40 34 Q43 32 46 34" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M54 34 Q57 32 60 34" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            {/* Nose & Confident Smile */}
            <path d="M50 38 L50 44 L48 45" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M45 49 Q50 53 55 49" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_free_male_2':
        // Omar Al-Hashemi - Steel-Blue Suit, Modern Open Collar, Factory Visionary
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-fm2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#082f49" />
                <stop offset="0.6" stopColor="#0e7490" />
                <stop offset="1" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="suit-fm2" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e3a8a" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-fm2)" />
            {/* Factory Glow */}
            <circle cx="50" cy="32" r="30" fill="#38bdf8" fillOpacity="0.15" />
            {/* Modern Slim Jacket */}
            <path d="M10 95 C10 68, 28 60, 50 60 C72 60, 90 68, 90 95 Z" fill="url(#suit-fm2)" />
            {/* Open Collar Shirt */}
            <polygon points="40,60 60,60 56,76 50,84 44,76" fill="#f0f9ff" />
            {/* Collar Wings */}
            <polygon points="38,60 46,72 40,73" fill="#e0f2fe" />
            <polygon points="62,60 54,72 60,73" fill="#e0f2fe" />
            {/* Industry Pin */}
            <polygon points="28,73 31,70 34,73 31,76" fill="#38bdf8" />
            {/* Neck */}
            <rect x="44" y="47" width="12" height="16" rx="4" fill="#fed7aa" />
            {/* Head & Youthful Jaw */}
            <path d="M33 37 C33 24, 67 24, 67 37 C67 52, 57 58, 50 58 C43 58, 33 52, 33 37 Z" fill="#fed7aa" />
            {/* Modern Quiff Hair */}
            <path d="M30 32 C28 17, 44 12, 54 13 C64 14, 72 22, 69 32 C65 24, 48 22, 40 26 C35 28, 31 29, 30 32 Z" fill="#292524" />
            {/* Neat Trim Beard */}
            <path d="M36 44 C38 56, 62 56, 64 44 C64 52, 58 57, 50 57 C42 57, 36 52, 36 44 Z" fill="#44403c" fillOpacity="0.45" />
            {/* Eyes */}
            <ellipse cx="43" cy="38" rx="2.4" ry="1.4" fill="#0c4a6e" />
            <ellipse cx="57" cy="38" rx="2.4" ry="1.4" fill="#0c4a6e" />
            {/* Eyebrows */}
            <path d="M39 34 Q43 32 46 34" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M54 34 Q57 32 61 34" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
            {/* Smile */}
            <path d="M45 49 Q50 52 55 49" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_free_female_1':
        // Dr. Sara Al-Rawi - Emerald Executive Blazer, Gold Chain, Visionary Leader
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-ff1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" />
                <stop offset="0.6" stopColor="#047857" />
                <stop offset="1" stopColor="#065f46" />
              </linearGradient>
              <linearGradient id="blazer-ff1" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#065f46" />
                <stop offset="1" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-ff1)" />
            {/* Leadership Radial Aura */}
            <circle cx="50" cy="32" r="32" fill="#34d399" fillOpacity="0.15" />
            {/* Flowing Styled Hair Behind */}
            <path d="M28 35 C24 50, 24 75, 33 85 C37 80, 42 70, 36 50 Z" fill="#1c1917" />
            <path d="M72 35 C76 50, 76 75, 67 85 C63 80, 58 70, 64 50 Z" fill="#1c1917" />
            {/* Emerald Tailored Blazer */}
            <path d="M12 95 C12 68, 28 61, 50 61 C72 61, 88 68, 88 95 Z" fill="url(#blazer-ff1)" />
            {/* Silk Top / Blouse */}
            <polygon points="41,61 59,61 55,79 50,83 45,79" fill="#ecfdf5" />
            {/* Gold Pendant Necklace */}
            <path d="M45 64 Q50 71 55 64" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="70" r="2.2" fill="#f59e0b" />
            {/* Blazer Lapels */}
            <polygon points="34,62 46,80 40,84 24,72" fill="#047857" />
            <polygon points="66,62 54,80 60,84 76,72" fill="#047857" />
            {/* Neck */}
            <rect x="44" y="47" width="12" height="16" rx="4" fill="#fde68a" fillOpacity="0.7" />
            {/* Head & Soft Executive Features */}
            <path d="M34 38 C34 25, 66 25, 66 38 C66 52, 58 57, 50 57 C42 57, 34 52, 34 38 Z" fill="#fed7aa" />
            {/* Elegant Coiffed Hair Crown */}
            <path d="M30 35 C28 18, 44 14, 52 14 C64 14, 72 20, 70 34 C64 26, 52 24, 43 27 C37 29, 32 32, 30 35 Z" fill="#1c1917" />
            {/* Pearl Earrings */}
            <circle cx="33" cy="42" r="2.5" fill="#fef08a" />
            <circle cx="67" cy="42" r="2.5" fill="#fef08a" />
            {/* Expressive Eyes with Lashes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#064e3b" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#064e3b" />
            <path d="M40 37 Q43 35 46 37" stroke="#1c1917" strokeWidth="1.2" />
            <path d="M54 37 Q57 35 60 37" stroke="#1c1917" strokeWidth="1.2" />
            {/* Gentle Warm Smile */}
            <path d="M45 49 Q50 53 55 49" stroke="#be185d" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_free_female_2':
        // Nour Al-Jaberi - Fuchsia/Rose Blazer, Modern Dynamic Entrepreneur
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-ff2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#701a75" />
                <stop offset="0.6" stopColor="#9d174d" />
                <stop offset="1" stopColor="#4a044e" />
              </linearGradient>
              <linearGradient id="blazer-ff2" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#be185d" />
                <stop offset="1" stopColor="#831843" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-ff2)" />
            <circle cx="50" cy="30" r="30" fill="#f472b6" fillOpacity="0.16" />
            {/* Flowing Waves Hair Behind */}
            <path d="M26 38 C22 55, 22 75, 30 84 C35 76, 38 66, 34 50 Z" fill="#292524" />
            <path d="M74 38 C78 55, 78 75, 70 84 C65 76, 62 66, 66 50 Z" fill="#292524" />
            {/* Rose Tailored Blazer */}
            <path d="M12 95 C12 68, 28 61, 50 61 C72 61, 88 68, 88 95 Z" fill="url(#blazer-ff2)" />
            {/* Silk Top */}
            <polygon points="42,61 58,61 54,77 50,81 46,77" fill="#fdf2f8" />
            {/* Diamond Bar Brooch */}
            <rect x="30" y="72" width="8" height="2.5" rx="1" fill="#fbcfe8" />
            {/* Lapels */}
            <polygon points="34,61 46,78 40,82 24,71" fill="#db2777" />
            <polygon points="66,61 54,78 60,82 76,71" fill="#db2777" />
            {/* Neck */}
            <rect x="44" y="47" width="12" height="16" rx="4" fill="#fed7aa" />
            {/* Head */}
            <path d="M34 38 C34 25, 66 25, 66 38 C66 52, 58 57, 50 57 C42 57, 34 52, 34 38 Z" fill="#fed7aa" />
            {/* Chic Hair Style */}
            <path d="M30 34 C28 18, 45 13, 53 14 C64 15, 72 22, 70 34 C63 25, 49 23, 40 27 C35 29, 31 31, 30 34 Z" fill="#292524" />
            {/* Earrings */}
            <circle cx="32" cy="42" r="2.2" fill="#f43f5e" />
            <circle cx="68" cy="42" r="2.2" fill="#f43f5e" />
            {/* Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#4a044e" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#4a044e" />
            {/* Smile */}
            <path d="M45 49 Q50 53 55 49" stroke="#9d174d" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_std_male_1':
        // Captain Tarek Selim - Maritime Admiral Double-Breasted Naval Blazer
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-sm1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0c1e33" />
                <stop offset="0.5" stopColor="#075985" />
                <stop offset="1" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="navy-sm1" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a" />
                <stop offset="1" stopColor="#020617" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-sm1)" />
            {/* Sea horizon glow */}
            <circle cx="50" cy="30" r="32" fill="#38bdf8" fillOpacity="0.15" />
            {/* Double Breasted Navy Coat */}
            <path d="M10 95 C10 66, 28 59, 50 59 C72 59, 90 66, 90 95 Z" fill="url(#navy-sm1)" />
            {/* Gold Anchor Buttons */}
            <circle cx="44" cy="74" r="2.5" fill="#f59e0b" />
            <circle cx="56" cy="74" r="2.5" fill="#f59e0b" />
            <circle cx="44" cy="84" r="2.5" fill="#f59e0b" />
            <circle cx="56" cy="84" r="2.5" fill="#f59e0b" />
            {/* Gold Lapel Anchor Pin */}
            <path d="M26 73 L32 73 M29 70 L29 77 M26 76 Q29 79 32 76" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
            {/* Epaulettes Gold Stripes */}
            <rect x="14" y="70" width="8" height="2" fill="#fbbf24" />
            <rect x="78" y="70" width="8" height="2" fill="#fbbf24" />
            {/* White Collar & Navy Tie */}
            <polygon points="43,59 57,59 50,70" fill="#f8fafc" />
            <polygon points="48,64 52,64 50,73" fill="#0369a1" />
            {/* Neck */}
            <rect x="44" y="46" width="12" height="16" rx="4" fill="#fbd5b5" />
            {/* Head & Seasoned Captain Jaw */}
            <path d="M33 37 C33 24, 67 24, 67 37 C67 52, 57 58, 50 58 C43 58, 33 52, 33 37 Z" fill="#fed7aa" />
            {/* Distinguished Salt & Pepper Hair & Beard */}
            <path d="M30 33 C28 18, 44 14, 52 14 C64 14, 71 21, 69 33 C64 25, 48 23, 40 27 C35 29, 31 31, 30 33 Z" fill="#334155" />
            <path d="M35 44 C37 57, 63 57, 65 44 C65 53, 58 58, 50 58 C42 58, 35 53, 35 44 Z" fill="#475569" fillOpacity="0.75" />
            {/* Moustache */}
            <path d="M43 47 Q50 49 57 47 Q50 51 43 47 Z" fill="#334155" />
            {/* Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#0284c7" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#0284c7" />
          </svg>
        );

      case 'avatar_std_female_1':
        // Rania Al-Sharif - High-Finance Banking Director, Violet Silk Pinstripe
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-sf1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b0764" />
                <stop offset="0.6" stopColor="#581c87" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="suit-sf1" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#581c87" />
                <stop offset="1" stopColor="#2e1065" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-sf1)" />
            {/* Violet Bank Vault Glow */}
            <circle cx="50" cy="32" r="30" fill="#c084fc" fillOpacity="0.16" />
            {/* Tailored Pinstripe Suit */}
            <path d="M12 95 C12 68, 28 61, 50 61 C72 61, 88 68, 88 95 Z" fill="url(#suit-sf1)" />
            {/* Fine Pinstripes */}
            <line x1="26" y1="70" x2="26" y2="95" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="34" y1="65" x2="34" y2="95" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="66" y1="65" x2="66" y2="95" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="74" y1="70" x2="74" y2="95" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4" />
            {/* Silver Credit Emblem */}
            <circle cx="30" cy="74" r="3" fill="#e9d5ff" />
            <polygon points="42,61 58,61 50,75" fill="#faf5ff" />
            {/* Head & Glasses for Strategic Financial Calculation */}
            <path d="M34 38 C34 25, 66 25, 66 38 C66 52, 58 57, 50 57 C42 57, 34 52, 34 38 Z" fill="#fed7aa" />
            {/* Sleek Bob Hair */}
            <path d="M29 35 C27 20, 42 14, 52 14 C64 14, 73 20, 71 35 C68 45, 67 52, 64 54 C61 46, 52 24, 40 26 C33 28, 30 33, 29 35 Z" fill="#18181b" />
            {/* Executive Silver Glasses Frame */}
            <rect x="38" y="35" width="10" height="7" rx="2" stroke="#e9d5ff" strokeWidth="1.2" fill="none" />
            <rect x="52" y="35" width="10" height="7" rx="2" stroke="#e9d5ff" strokeWidth="1.2" fill="none" />
            <line x1="48" y1="38" x2="52" y2="38" stroke="#e9d5ff" strokeWidth="1.2" />
            {/* Diamonds Earring */}
            <polygon points="32,44 34,42 32,40 30,42" fill="#c084fc" />
            <polygon points="68,44 70,42 68,40 66,42" fill="#c084fc" />
            {/* Lip Smile */}
            <path d="M46 49 Q50 52 54 49" stroke="#a21caf" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_exec_male_1':
        // Ziad Al-Fayed - AI Tech Mogul with Luminous Quantum Badge & Futuristic Tailored Jacket
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-em1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#083344" />
                <stop offset="0.5" stopColor="#0f766e" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="cyber-jacket" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a" />
                <stop offset="0.6" stopColor="#1e293b" />
                <stop offset="1" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-em1)" />
            {/* Digital Grid Circuit */}
            <circle cx="50" cy="30" r="32" fill="#06b6d4" fillOpacity="0.18" />
            <path d="M15 20 L25 20 L30 30" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
            <path d="M85 20 L75 20 L70 30" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
            {/* Cyber Executive Jacket */}
            <path d="M10 95 C10 67, 28 60, 50 60 C72 60, 90 67, 90 95 Z" fill="url(#cyber-jacket)" />
            {/* Glowing Tech Lapel Line */}
            <path d="M35 62 L45 80" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            {/* AI Quantum Core Brooch */}
            <polygon points="30,73 34,69 38,73 34,77" fill="#22d3ee" />
            <circle cx="34" cy="73" r="1.5" fill="#f8fafc" />
            {/* Dark Tech Turtleneck */}
            <polygon points="42,60 58,60 55,75 50,78 45,75" fill="#090d16" />
            {/* Head & Visionary Jaw */}
            <path d="M33 37 C33 24, 67 24, 67 37 C67 52, 57 58, 50 58 C43 58, 33 52, 33 37 Z" fill="#fed7aa" />
            {/* Futuristic Tech Eyewear */}
            <rect x="36" y="34" width="28" height="6" rx="2" fill="#0891b2" fillOpacity="0.4" stroke="#22d3ee" strokeWidth="1" />
            {/* Tech Crop Hair */}
            <path d="M30 32 C28 17, 44 12, 54 13 C64 14, 72 21, 70 32 C65 24, 48 22, 40 26 C35 28, 31 29, 30 32 Z" fill="#1e293b" />
            {/* Precise Trim Beard */}
            <path d="M36 45 C38 56, 62 56, 64 45 C64 53, 58 57, 50 57 C42 57, 36 53, 36 45 Z" fill="#334155" fillOpacity="0.5" />
          </svg>
        );

      case 'avatar_exec_female_1':
        // Shams Al-Maamari - Skyscraper Real Estate Tycoon, Sunset Amber & Geometric Golden Crown
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-ef1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c2d12" />
                <stop offset="0.5" stopColor="#c2410c" />
                <stop offset="1" stopColor="#431407" />
              </linearGradient>
              <linearGradient id="blazer-ef1" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9a3412" />
                <stop offset="1" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-ef1)" />
            {/* Skyscraper Silhouette in Background */}
            <rect x="20" y="24" width="10" height="30" rx="1" fill="#ea580c" fillOpacity="0.25" />
            <rect x="70" y="18" width="12" height="36" rx="1" fill="#ea580c" fillOpacity="0.25" />
            <polygon points="76,12 73,18 79,18" fill="#f97316" fillOpacity="0.35" />
            {/* High-Rise Luxury Blazer */}
            <path d="M12 95 C12 68, 28 61, 50 61 C72 61, 88 68, 88 95 Z" fill="url(#blazer-ef1)" />
            {/* Gold Lapel Trim */}
            <polygon points="34,61 46,79 40,83 24,71" fill="#ea580c" />
            <polygon points="66,61 54,79 60,83 76,71" fill="#ea580c" />
            <line x1="34" y1="61" x2="46" y2="79" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="66" y1="61" x2="54" y2="79" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Golden Tower Brooch */}
            <polygon points="28,74 31,69 34,74" fill="#fbbf24" />
            <rect x="29.5" y="74" width="3" height="5" fill="#f59e0b" />
            {/* Head & Glamour */}
            <path d="M34 38 C34 25, 66 25, 66 38 C66 52, 58 57, 50 57 C42 57, 34 52, 34 38 Z" fill="#fed7aa" />
            {/* Voluminous Royal Brown Waves */}
            <path d="M28 35 C26 18, 44 13, 52 14 C64 14, 73 20, 71 35 C75 48, 72 70, 66 78 C62 70, 58 58, 62 46 C58 26, 48 24, 38 27 C33 29, 29 32, 28 35 Z" fill="#292524" />
            {/* Gold Drop Earrings */}
            <circle cx="32" cy="42" r="2.5" fill="#fbbf24" />
            <line x1="32" y1="44" x2="32" y2="49" stroke="#fbbf24" strokeWidth="1.2" />
            <polygon points="32,52 30,49 34,49" fill="#f59e0b" />
            <circle cx="68" cy="42" r="2.5" fill="#fbbf24" />
            <line x1="68" y1="44" x2="68" y2="49" stroke="#fbbf24" strokeWidth="1.2" />
            <polygon points="68,52 66,49 70,49" fill="#f59e0b" />
            {/* Commanding Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#7c2d12" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#7c2d12" />
            <path d="M45 49 Q50 53 55 49" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'avatar_vip_male_1':
        // Sultan Al-Otaibi - Imperial Sovereign Billionaire in Jet-Black Tuxedo & Gold Emblem
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-vm1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#09090b" />
                <stop offset="0.5" stopColor="#27272a" />
                <stop offset="1" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="gold-vm1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" />
                <stop offset="0.5" stopColor="#eab308" />
                <stop offset="1" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-vm1)" />
            {/* Imperial Gold Aura */}
            <circle cx="50" cy="30" r="32" fill="#fbbf24" fillOpacity="0.25" />
            {/* Sovereign Tuxedo */}
            <path d="M10 95 C10 66, 28 59, 50 59 C72 59, 90 66, 90 95 Z" fill="#09090b" />
            {/* Gold Embroidered Satin Lapel */}
            <polygon points="32,60 46,84 38,88 22,74" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
            <polygon points="68,60 54,84 62,88 78,74" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
            {/* Crisp Tuxedo Pleats */}
            <polygon points="42,59 58,59 54,82 50,86 46,82" fill="#f8fafc" />
            {/* Gold Bowtie */}
            <polygon points="45,64 50,66 45,68" fill="url(#gold-vm1)" />
            <polygon points="55,64 50,66 55,68" fill="url(#gold-vm1)" />
            <circle cx="50" cy="66" r="1.5" fill="#fef08a" />
            {/* Sovereign Imperial Crest */}
            <polygon points="34,76 37,72 40,76 37,80" fill="url(#gold-vm1)" />
            {/* Head & Regal Gaze */}
            <path d="M33 37 C33 24, 67 24, 67 37 C67 52, 57 58, 50 58 C43 58, 33 52, 33 37 Z" fill="#fed7aa" />
            {/* Jet-Black Executive Styling with Regal Crown Motif Behind */}
            <path d="M30 33 C28 18, 44 13, 52 14 C64 14, 71 21, 69 33 C64 25, 48 23, 40 27 C35 29, 31 31, 30 33 Z" fill="#09090b" />
            {/* Groomed Royal Beard */}
            <path d="M36 44 C38 56, 62 56, 64 44 C64 53, 58 58, 50 58 C42 58, 36 53, 36 44 Z" fill="#18181b" fillOpacity="0.85" />
            {/* Regal Crown Atop */}
            <path d="M43 11 L46 15 L50 9 L54 15 L57 11 L56 18 L44 18 Z" fill="url(#gold-vm1)" />
            {/* Penetrating Golden Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#ca8a04" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#ca8a04" />
          </svg>
        );

      case 'avatar_vip_female_1':
        // Princess Nadia Al-Husseini - Sovereign Gold & Investment Queen
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-vf1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#451a03" />
                <stop offset="0.5" stopColor="#78350f" />
                <stop offset="1" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="gold-vf1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef9c3" />
                <stop offset="0.5" stopColor="#facc15" />
                <stop offset="1" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#bg-vf1)" />
            {/* Shimmering Gold Aura */}
            <circle cx="50" cy="30" r="32" fill="#facc15" fillOpacity="0.25" />
            {/* Royal Gold Brocade Cape */}
            <path d="M10 95 C10 65, 26 58, 50 58 C74 58, 90 65, 90 95 Z" fill="url(#gold-vf1)" />
            {/* Deep Velvet Inner Gown */}
            <polygon points="40,58 60,58 56,82 50,86 44,82" fill="#18181b" />
            {/* Royal Diamond & Gold Cascade Necklace */}
            <path d="M43 62 Q50 72 57 62" stroke="#fef08a" strokeWidth="2" fill="none" />
            <circle cx="50" cy="71" r="3" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            {/* Sovereign Tiara / Diadem */}
            <path d="M41 14 L45 19 L50 12 L55 19 L59 14 L58 22 L42 22 Z" fill="url(#gold-vf1)" />
            <circle cx="50" cy="16" r="1.5" fill="#ffffff" />
            {/* Head & Queenly Countenance */}
            <path d="M34 38 C34 25, 66 25, 66 38 C66 52, 58 57, 50 57 C42 57, 34 52, 34 38 Z" fill="#fed7aa" />
            {/* Elegant Coiffed Hair with Gold Filigree */}
            <path d="M28 35 C26 18, 44 14, 52 14 C64 14, 74 20, 72 35 C75 48, 73 70, 67 78 C63 70, 59 58, 63 46 C59 26, 48 24, 38 27 C33 29, 29 32, 28 35 Z" fill="#1c1917" />
            {/* Diamond Earrings */}
            <polygon points="32,44 34,41 32,38 30,41" fill="#fef08a" />
            <polygon points="68,44 70,41 68,38 66,41" fill="#fef08a" />
            {/* Eyes */}
            <ellipse cx="43" cy="38" rx="2.5" ry="1.5" fill="#854d0e" />
            <ellipse cx="57" cy="38" rx="2.5" ry="1.5" fill="#854d0e" />
            <path d="M45 49 Q50 53 55 49" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 font-black">
            {avatar.roleIcon || '👤'}
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative inline-flex shrink-0 items-center justify-center select-none rounded-2xl overflow-visible transition-all duration-200 ${sizeConfig.dimension} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      title={alt || `${avatar.name} - ${avatar.title}`}
    >
      {/* Outer Border / Glow Ring */}
      <div
        className={`w-full h-full rounded-2xl overflow-hidden p-0.5 shadow-lg ${
          showBorder
            ? avatar.tier === 'vip'
              ? 'bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 shadow-yellow-500/30'
              : avatar.tier === 'executive'
              ? 'bg-gradient-to-tr from-cyan-400 via-teal-500 to-amber-500 shadow-teal-500/20'
              : avatar.tier === 'standard'
              ? 'bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-blue-500/20'
              : 'bg-gradient-to-tr from-amber-500 via-slate-700 to-yellow-500 shadow-amber-500/15'
            : ''
        }`}
      >
        <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center">
          {renderVisual()}
        </div>
      </div>

      {/* VIP / Executive Crown Badge */}
      {avatar.tier === 'vip' && (
        <span
          className={`absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md border border-yellow-200 ${sizeConfig.crownSize}`}
          title="شخصية VIP نخبة"
        >
          👑
        </span>
      )}

      {/* Optional Badge Overlay */}
      {showBadge && (
        <span className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-slate-950/90 text-amber-300 border border-amber-500/40 text-[9px] font-bold shadow">
          {avatar.badgeLabel}
        </span>
      )}
    </div>
  );
}
