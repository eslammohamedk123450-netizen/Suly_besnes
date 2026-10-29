/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  Factory,
  Compass,
  Moon,
  Sun,
  Maximize2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface CityControlsBarProps {
  onSelectPreset: (
    preset:
      | 'center'
      | 'hq'
      | 'bank'
      | 'stock_exchange'
      | 'factory'
      | 'tech'
      | 'maritime'
      | 'gov'
      | 'trade'
      | 'luxury'
      | 'plots'
  ) => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  timeOfDay?: 'day' | 'sunset' | 'night';
  onCycleTimeOfDay?: () => void;
  activeView: 'isometric_city' | 'dashboard';
  onToggleView: (view: 'isometric_city' | 'dashboard') => void;
}

export const CityControlsBar: React.FC<CityControlsBarProps> = ({
  onSelectPreset,
  isNightMode,
  onToggleNightMode,
  timeOfDay = isNightMode ? 'night' : 'sunset',
  onCycleTimeOfDay,
  activeView,
  onToggleView,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'buildings' | 'roads' | 'nature' | 'services'>('buildings');

  return (
    <div className="w-full flex flex-col items-center select-none pt-2">
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-3 py-1 rounded-t-xl bg-slate-900/90 border-t border-x border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg hover:text-amber-300 transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>إظهار أزرار التحكم بالكاميرا وأحياء المدينة</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>إخفاء عناصر التحكم (وضع السينما)</span>
          </>
        )}
      </button>

      {/* Main Bottom Control Dock */}
      {!isCollapsed && (
        <div className="w-full bg-slate-900/95 border border-amber-500/30 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mobile build palette: selecting a category focuses the placement plots. */}
          <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800">
            {([
              ['buildings', 'المباني 🏢'],
              ['roads', 'الطرق 🛣️'],
              ['nature', 'الطبيعة 🌳'],
              ['services', 'الخدمات ⚙️'],
            ] as const).map(([category, label]) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  onSelectPreset('plots');
                }}
                className={`shrink-0 rounded-xl border px-3 py-2 font-bold transition-all ${
                  selectedCategory === category
                    ? 'border-amber-400/70 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="mr-auto shrink-0 text-[10px] text-slate-500">اضغط على قطعة أرض لوضع العنصر</span>
          </div>

          {/* The city is the only gameplay view; legacy dashboard navigation is retired. */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleView('isometric_city')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'isometric_city'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>المدينة 3D</span>
            </button>

            {/* Daily Quests button in the dock */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open_quest_manager'))}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="المهام اليومية ومكافآت الألماس (Daily Quests)"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-950" />
              <span>المهام اليومية</span>
            </button>
          </div>

          {/* Camera Focus Presets across All Districts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectPreset('center')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="إعادة الكاميرا إلى المركز"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>المركز</span>
            </button>
            <button
              onClick={() => onSelectPreset('hq')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold flex items-center gap-1 transition-colors border border-amber-500/30"
              title="التركيز على البرج الإمبراطوري"
            >
              <span>المقر 👑</span>
            </button>
            <button
              onClick={() => onSelectPreset('stock_exchange')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على البورصة"
            >
              <span>البورصة 📈</span>
            </button>
            <button
              onClick={() => onSelectPreset('bank')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على البنك المركزي"
            >
              <span>البنك 🏦</span>
            </button>
            <button
              onClick={() => onSelectPreset('tech')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على وادي التكنولوجيا"
            >
              <span>التكنولوجيا 🔬</span>
            </button>
            <button
              onClick={() => onSelectPreset('maritime')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على الميناء والأسطول"
            >
              <span>الميناء 🚢</span>
            </button>
            <button
              onClick={() => onSelectPreset('gov')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على المنطقة الحكومية"
            >
              <span>الحكومة 🏛️</span>
            </button>
            <button
              onClick={() => onSelectPreset('trade')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على حي المزادات والتجارة"
            >
              <span>المزادات ⚖️</span>
            </button>
            <button
              onClick={() => onSelectPreset('luxury')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على ساحل الرفاهية واليخوت"
            >
              <span>الرفاهية 🛥️</span>
            </button>
            <button
              onClick={() => onSelectPreset('plots')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على الأراضي الاستثمارية"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأراضي</span>
            </button>
          </div>

          {/* Sky & Atmosphere lighting toggle (Sunset / Night / Day) */}
          <button
            onClick={onCycleTimeOfDay || onToggleNightMode}
            className="p-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors border border-amber-500/30 flex items-center gap-1.5 shadow-md active:scale-95"
            title="تبديل الإضاءة الجوية (غروب سينمائي / ليلي فاخر / نهاري مشرق)"
          >
            {timeOfDay === 'sunset' ? (
              <>
                <span className="text-sm">🌅</span>
                <span className="text-[11px] text-orange-300 font-bold">غروب سينمائي</span>
              </>
            ) : timeOfDay === 'night' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] text-sky-200 font-medium">ليلي فاخر</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-200 font-medium">نهاري مشرق</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
