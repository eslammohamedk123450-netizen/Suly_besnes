import React from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { Home, Factory, ShoppingCart, Landmark, Sparkles, Lock } from 'lucide-react';
import { playSound } from '../game/soundEffects';
import { isSectionUnlocked, getSectionRequiredLevel } from '../game/onboarding';

interface MobileBottomNavProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onOpenLuckyWheel: () => void;
  isFreeSpinAvailable: boolean;
  profile?: PlayerProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigate,
  onOpenLuckyWheel,
  isFreeSpinAvailable,
  profile,
}) => {
  const handleNav = (section: SectionId) => {
    playSound('click');
    onNavigate(section);
  };

  const isProductionOpen = profile ? isSectionUnlocked(profile, 'production') : true;
  const isInventoryOpen = profile ? isSectionUnlocked(profile, 'inventory') : true;
  const isBankOpen = profile ? isSectionUnlocked(profile, 'bank') : true;

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
      dir="rtl"
      aria-label="شريط التنقل السفلي للهاتف"
    >
      {/* 1. Home */}
      <button
        onClick={() => handleNav('home')}
        data-guide-nav="home"
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeSection === 'home'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeSection === 'home' ? 'text-amber-400' : ''}`} />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      {/* 2. Factories / Production */}
      <button
        onClick={() => handleNav('production')}
        data-guide-nav="production"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition relative ${
          activeSection === 'production' || activeSection === 'companies'
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Factory className={`w-5 h-5 ${activeSection === 'production' || activeSection === 'companies' ? 'text-emerald-400' : ''}`} />
          {!isProductionOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-900 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م2
            </span>
          )}
        </div>
        <span className="text-[10px]">المصانع</span>
      </button>

      {/* 3. Lucky Wheel (Center Highlight) */}
      <button
        onClick={() => {
          playSound('click');
          onOpenLuckyWheel();
        }}
        className="relative -top-3 flex flex-col items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-slate-900 transition-transform active:scale-95">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        {isFreeSpinAvailable && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-950 animate-ping" />
        )}
        <span className="text-[10px] font-bold text-amber-300 mt-0.5">عجلة الحظ</span>
      </button>

      {/* 4. Market / Inventory */}
      <button
        onClick={() => handleNav('inventory')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition relative ${
          activeSection === 'inventory' || activeSection === 'auctions' || activeSection === 'lands'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShoppingCart className={`w-5 h-5 ${activeSection === 'inventory' || activeSection === 'auctions' || activeSection === 'lands' ? 'text-blue-400' : ''}`} />
          {!isInventoryOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-900 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م2
            </span>
          )}
        </div>
        <span className="text-[10px]">السوق</span>
      </button>

      {/* 5. Bank / Gold */}
      <button
        onClick={() => handleNav('bank')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition relative ${
          activeSection === 'bank' || activeSection === 'investments' || activeSection === 'tasks'
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Landmark className={`w-5 h-5 ${activeSection === 'bank' || activeSection === 'investments' ? 'text-purple-400' : ''}`} />
          {!isBankOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-900 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م4
            </span>
          )}
        </div>
        <span className="text-[10px]">البنك</span>
      </button>
    </nav>
  );
};
