import React from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { Home, Factory, ShoppingCart, Landmark, Building2, Lock } from 'lucide-react';
import { playSound } from '../game/soundEffects';
import { triggerHaptic } from '../services/nativeMobileService';
import { isSectionUnlocked } from '../game/onboarding';

interface MobileBottomNavProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onOpenCentralOperations: () => void;
  profile?: PlayerProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigate,
  onOpenCentralOperations,
  profile,
}) => {
  const handleNav = (section: SectionId) => {
    triggerHaptic('light');
    playSound('click');
    onNavigate(section);
  };

  const isProductionOpen = profile ? isSectionUnlocked(profile, 'production') : true;
  const isInventoryOpen = profile ? isSectionUnlocked(profile, 'inventory') : true;
  const isBankOpen = profile ? isSectionUnlocked(profile, 'bank') : true;

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d18]/85 backdrop-blur-xl border-t border-amber-400/25 px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.65)] safe-area-pb"
      dir="rtl"
      aria-label="شريط التنقل السفلي للهاتف"
    >
      {/* Delicate Gold Top Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/35 to-transparent pointer-events-none" />

      {/* 1. Home */}
      <button
        onClick={() => handleNav('home')}
        data-guide-nav="home"
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeSection === 'home'
            ? 'bg-[#101b2d]/80 text-amber-300 font-bold border border-amber-400/35 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeSection === 'home' ? 'text-amber-300' : ''}`} />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      {/* 2. Factories / Production */}
      <button
        onClick={() => handleNav('production')}
        data-guide-nav="production"
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative ${
          activeSection === 'production' || activeSection === 'companies'
            ? 'bg-[#101b2d]/80 text-amber-300 font-bold border border-amber-400/35 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Factory className={`w-5 h-5 ${activeSection === 'production' || activeSection === 'companies' ? 'text-amber-300' : ''}`} />
          {!isProductionOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-950 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م2
            </span>
          )}
        </div>
        <span className="text-[10px]">المصانع</span>
      </button>

      {/* 3. Central Operations Room */}
      <button
        onClick={() => {
          playSound('click');
          onOpenCentralOperations();
        }}
        className="relative -top-3 flex flex-col items-center justify-center group"
        aria-label="غرفة العمليات المركزية"
        title="غرفة العمليات المركزية - جميع أنظمة اللعبة"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#18263d] via-[#101a2d] to-[#09101b] text-amber-300 flex items-center justify-center shadow-lg shadow-black/70 border-2 border-amber-400/70 group-hover:border-amber-300 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all active:scale-95">
          <Building2 className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-amber-300/90 mt-0.5">غرفة العمليات المركزية</span>
      </button>

      {/* 4. Market / Inventory */}
      <button
        onClick={() => handleNav('inventory')}
        data-guide-nav="inventory"
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative ${
          activeSection === 'inventory' || activeSection === 'auctions' || activeSection === 'lands'
            ? 'bg-[#101b2d]/80 text-amber-300 font-bold border border-amber-400/35 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShoppingCart className={`w-5 h-5 ${activeSection === 'inventory' || activeSection === 'auctions' || activeSection === 'lands' ? 'text-amber-300' : ''}`} />
          {!isInventoryOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-950 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م2
            </span>
          )}
        </div>
        <span className="text-[10px]">السوق</span>
      </button>

      {/* 5. Bank / Gold */}
      <button
        onClick={() => handleNav('bank')}
        data-guide-nav="bank"
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative ${
          activeSection === 'bank' || activeSection === 'investments' || activeSection === 'tasks'
            ? 'bg-[#101b2d]/80 text-amber-300 font-bold border border-amber-400/35 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Landmark className={`w-5 h-5 ${activeSection === 'bank' || activeSection === 'investments' ? 'text-amber-300' : ''}`} />
          {!isBankOpen && (
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-slate-950 border border-amber-500/60 text-[8px] text-amber-300 font-bold flex items-center gap-0.5">
              <Lock className="w-2 h-2 text-amber-400" /> م4
            </span>
          )}
        </div>
        <span className="text-[10px]">البنك</span>
      </button>
    </nav>
  );
};
