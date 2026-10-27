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
  LayoutDashboard,
  Maximize2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface CityControlsBarProps {
  onSelectPreset: (preset: 'center' | 'hq' | 'bank' | 'factory' | 'plots') => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  activeView: '3d_city' | 'dashboard';
  onToggleView: (view: '3d_city' | 'dashboard') => void;
}

export const CityControlsBar: React.FC<CityControlsBarProps> = ({
  onSelectPreset,
  isNightMode,
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
            <span>إظهار أزرار التحكم بالكاميرا والمدينة</span>
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
          {/* View Switcher: 3D City vs Executive Dashboard */}
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
            <button
              onClick={() => onToggleView('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>اللوحة التنفيذية</span>
            </button>
          </div>

          {/* Camera Focus Presets */}
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
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على البرج الإمبراطوري"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>المقر</span>
            </button>
            <button
              onClick={() => onSelectPreset('bank')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على البنك المركزي"
            >
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              <span>البنك</span>
            </button>
            <button
              onClick={() => onSelectPreset('factory')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على مجمع المصانع"
            >
              <Factory className="w-3.5 h-3.5 text-orange-400" />
              <span>المصانع</span>
            </button>
            <button
              onClick={() => onSelectPreset('plots')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors border border-slate-700"
              title="التركيز على الأراضي الاستثمارية"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأراضي</span>
            </button>
          </div>

          {/* Day / Night lighting toggle */}
          <button
            onClick={onToggleNightMode}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors border border-slate-700 flex items-center gap-1.5"
            title="تبديل وضع الإضاءة (ليلي / نهاري)"
          >
            {isNightMode ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px] text-slate-300 font-medium">ليلي فاخر</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px] text-slate-300 font-medium">نهاري مشرق</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
