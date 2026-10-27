/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import type { GameCommand, GameResult } from '../game/engine';
import { CityCanvas, type SelectedItem, type CityCameraPreset } from './city3d/CityCanvas';
import { BuildingDetailSheet } from './city3d/BuildingDetailSheet';
import { BranchAndShopSheet } from './city3d/BranchAndShopSheet';
import { CityControlsBar } from './city3d/CityControlsBar';
import { Dashboard } from './Dashboard';
import { formatMoney } from '../domain/formatters';
import {
  Building2,
  Landmark,
  Factory,
  Store,
  MapPin,
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ChevronLeft,
  Ship,
  Gavel,
} from 'lucide-react';

interface CityHomeViewProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (
    command: GameCommand,
    fallback: (current: PlayerProfile) => GameResult<unknown>
  ) => void;
  onClaimReward?: (cash: number, diamonds: number, questId: string) => void;
  onUpdateProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onOpenLuckyWheel?: () => void;
  onOpenTutorial?: () => void;
  onOpenMorningReport?: () => void;
  onOpenCentralBank?: () => void;
  onOpenPrestige?: () => void;
  onOpenStrategicPillars?: () => void;
}

export const CityHomeView: React.FC<CityHomeViewProps> = (props) => {
  const { profile, country, onNavigate, onCommand } = props;
  const [activeView, setActiveView] = useState<'3d_city' | 'dashboard'>('3d_city');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isNightMode, setIsNightMode] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CityCameraPreset>(null);
  const [isBranchShopOpen, setIsBranchShopOpen] = useState(false);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);

  const handleRefreshGrid = () => {
    setGridRefreshKey((k) => k + 1);
  };

  const handleProfileUpdate = (updated: PlayerProfile) => {
    if (props.onUpdateProfile) {
      props.onUpdateProfile(() => updated);
    }
    handleRefreshGrid();
  };

  const handleCloseSheets = () => {
    setSelectedItem(null);
    setIsBranchShopOpen(false);
  };

  const handleSelectItem = (item: SelectedItem | null) => {
    setIsBranchShopOpen(false);
    setSelectedItem(item);
  };

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* 3D City View Header / Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white text-base">مدينة الأعمال الإمبراطورية الكبرى</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                خريطة 3D واقعية متكاملة
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المقر الإمبراطوري، البورصة، البنك، الأسطول الملاحي، وادي التكنولوجيا، والمشاريع القومية في عاصمة {country.name}
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">المصانع:</span>
            <span className="font-bold text-amber-300">{profile.companies.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">الأراضي:</span>
            <span className="font-bold text-emerald-400">{profile.lands.length}</span>
          </div>
        </div>
      </div>

      {/* Main View Area: Either 3D City or Classic Dashboard */}
      {activeView === '3d_city' ? (
        <div className="relative w-full space-y-3">
          {/* Interactive 3D Canvas */}
          <div className="relative">
            <CityCanvas
              key={`city-canvas-${gridRefreshKey}`}
              profile={profile}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              isNightMode={isNightMode}
              cameraPreset={cameraPreset}
              onResetPreset={() => setCameraPreset(null)}
            />

            {/* Instruction badge over canvas for first-time / touch feedback */}
            <div className="absolute top-3 right-3 pointer-events-none bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>خريطة 3D حية: اضغط على أي مبنى للتفاعل مع نظامه</span>
            </div>

            {/* Active Landmark Quick Floating Bar */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[80vw] overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => {
                  setCameraPreset('hq');
                  handleSelectItem({ type: 'landmark', id: 'hq' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>المقر 👑</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('stock_exchange');
                  handleSelectItem({ type: 'landmark', id: 'stock_exchange' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>البورصة 📈</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('bank');
                  handleSelectItem({ type: 'landmark', id: 'bank' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>البنك 🏦</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('tech');
                  handleSelectItem({ type: 'landmark', id: 'tech_tree' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>التكنولوجيا 🔬</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('maritime');
                  handleSelectItem({ type: 'landmark', id: 'maritime' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>الميناء 🚢</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('gov');
                  handleSelectItem({ type: 'landmark', id: 'megaprojects' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>المشاريع 🏛️</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('trade');
                  handleSelectItem({ type: 'landmark', id: 'auctions' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>المزادات ⚖️</span>
              </button>
              <button
                onClick={() => {
                  setCameraPreset('luxury');
                  handleSelectItem({ type: 'landmark', id: 'luxury_club' });
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all shrink-0"
              >
                <span>الرفاهية 🛥️</span>
              </button>
            </div>

            {/* Slide-up Detail Sheet for Selected Building or Plot */}
            {selectedItem?.type === 'plot' &&
            (isBranchShopOpen || selectedItem.plot.branch || selectedItem.plot.shop) ? (
              <BranchAndShopSheet
                plot={selectedItem.plot}
                profile={profile}
                onClose={handleCloseSheets}
                onRefreshGrid={handleRefreshGrid}
                onProfileUpdate={handleProfileUpdate}
              />
            ) : (
              <BuildingDetailSheet
                selectedItem={selectedItem}
                profile={profile}
                onClose={handleCloseSheets}
                onNavigate={onNavigate}
                onCommand={onCommand}
                onRefreshGrid={handleRefreshGrid}
                onOpenBranchShop={() => setIsBranchShopOpen(true)}
                onOpenLuckyWheel={props.onOpenLuckyWheel}
                onOpenPrestige={props.onOpenPrestige}
              />
            )}
          </div>

          {/* Unified Bottom Controls Bar */}
          <CityControlsBar
            onSelectPreset={setCameraPreset}
            isNightMode={isNightMode}
            onToggleNightMode={() => setIsNightMode(!isNightMode)}
            activeView={activeView}
            onToggleView={setActiveView}
          />

          {/* Quick-Action Tiles connecting to other parts of the empire */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => onNavigate('lands')}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-right transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-white">إدارة الأراضي والأصول</div>
                <div className="text-[11px] text-slate-400">سجل المواقع والكتالوج الكامل</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('production')}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-right transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Factory className="w-5 h-5 text-orange-400" />
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-white">خطوط الإنتاج والتصنيع</div>
                <div className="text-[11px] text-slate-400">التشغيل، الصيانة، والورديات</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('bank')}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-right transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Landmark className="w-5 h-5 text-sky-400" />
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-white">التمويل والودائع البنكية</div>
                <div className="text-[11px] text-slate-400">القروض والأرباح المركبة</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-right transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-white">بورصة السلع والأسواق</div>
                <div className="text-[11px] text-slate-400">بيع المنتجات وتوريد المواد</div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Classic Executive Dashboard View */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
            <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>الوضع التنفيذي الكلاسيكي مفعل</span>
            </span>
            <button
              onClick={() => setActiveView('3d_city')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Building2 className="w-4 h-4" />
              <span>العودة إلى خريطة المدينة 3D</span>
            </button>
          </div>

          <Dashboard {...props} />
        </div>
      )}
    </div>
  );
};

export default CityHomeView;
