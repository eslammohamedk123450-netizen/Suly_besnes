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
} from 'lucide-react';

import type { TimeOfDay } from './cityMaterials';

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
  timeOfDay?: TimeOfDay;
  onChangeTimeOfDay?: (mode: TimeOfDay) => void;
  autoCycle?: boolean;
  onToggleAutoCycle?: () => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  activeView: '3d_city' | 'dashboard';
  onToggleView: (view: '3d_city' | 'dashboard') => void;
}

export const CityControlsBar: React.FC<CityControlsBarProps> = ({
  onSelectPreset,
  timeOfDay = 'sunset',
  onChangeTimeOfDay,
  autoCycle = false,
  onToggleAutoCycle,
  isNightMode = false,
  onToggleNightMode,
  activeView,
  onToggleView,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          {/* The city is the only gameplay view; legacy dashboard navigation is retired. */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleView('3d_city')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === '3d_city'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>المدينة 3D</span>
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

          {/* Day / Night / Sunset Lighting Rig Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeTimeOfDay ? onChangeTimeOfDay('sunset') : onToggleNightMode?.()}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                timeOfDay === 'sunset'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'text-orange-300 hover:text-white hover:bg-slate-900'
              }`}
              title="غروب ساحر بألوان برتقالية بنفسجية وظلال ذهبية ممتدة"
            >
              <span>🌅 الغروب</span>
            </button>
            <button
              onClick={() => onChangeTimeOfDay ? onChangeTimeOfDay('night') : onToggleNightMode?.()}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                timeOfDay === 'night'
                  ? 'bg-indigo-600 text-amber-200 shadow-md shadow-indigo-500/20'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-900'
              }`}
              title="ليل هادئ مع نوافذ صفراء متوهجة وضوء قمر واقعي"
            >
              <Moon className="w-3.5 h-3.5 text-amber-300" />
              <span>الليل</span>
            </button>
            <button
              onClick={() => onChangeTimeOfDay ? onChangeTimeOfDay('day') : onToggleNightMode?.()}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                timeOfDay === 'day'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-sky-300 hover:text-white hover:bg-slate-900'
              }`}
              title="نهار مشرق مشمس مع ظلال واضحة"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>النهار</span>
            </button>
            {onToggleAutoCycle && (
              <button
                onClick={onToggleAutoCycle}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  autoCycle
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="تدوير زمني تلقائي للمدينة"
              >
                <Sparkles className="w-3 h-3" />
                <span>دوران زمني</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
