import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import {
  AVATAR_CATALOG,
  CharacterAvatar,
  getAvatarById,
  isAvatarUnlocked,
} from '../domain/avatars';
import { AvatarPortrait } from './AvatarPortrait';
import { playSound } from '../game/soundEffects';
import {
  X,
  Sparkles,
  Check,
  Lock,
  Crown,
  Gem,
  Briefcase,
  Quote,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AvatarWardrobeModalProps {
  profile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
  onUnlockAvatar: (avatar: CharacterAvatar) => boolean;
  onOpenStore?: () => void;
}

type TabKey = 'all' | 'men' | 'women' | 'owned' | 'vip';

export function AvatarWardrobeModal({
  profile,
  isOpen,
  onClose,
  onSelectAvatar,
  onUnlockAvatar,
  onOpenStore,
}: AvatarWardrobeModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>(
    profile.avatarId || 'avatar_free_male_1'
  );
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAvatarId = profile.avatarId || 'avatar_free_male_1';
  const unlockedIds = profile.unlockedAvatarIds || [];
  const previewAvatar = getAvatarById(selectedPreviewId);
  const isSelectedUnlocked = isAvatarUnlocked(selectedPreviewId, unlockedIds);
  const isSelectedActive = currentAvatarId === selectedPreviewId;

  // Filter avatars based on tab
  const filteredAvatars = AVATAR_CATALOG.filter((avatar) => {
    const isUnlocked = isAvatarUnlocked(avatar.id, unlockedIds);
    if (activeTab === 'men') return avatar.gender === 'male';
    if (activeTab === 'women') return avatar.gender === 'female';
    if (activeTab === 'owned') return isUnlocked;
    if (activeTab === 'vip') return avatar.tier === 'vip' || avatar.tier === 'executive';
    return true; // 'all'
  });

  const handleApplyAvatar = (avatarId: string) => {
    playSound('click');
    onSelectAvatar(avatarId);
  };

  const handleBuyAvatar = (avatar: CharacterAvatar) => {
    setPurchaseError(null);
    if ((profile.diamonds ?? 0) < avatar.priceDiamonds) {
      playSound('error');
      setPurchaseError(`رصيدك الحالي (${profile.diamonds} 💎) غير كافٍ لاقتناء هذه الشخصية (${avatar.priceDiamonds} 💎).`);
      return;
    }
    const success = onUnlockAvatar(avatar);
    if (success) {
      playSound('success');
      setSelectedPreviewId(avatar.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>خزانة ومعرض صور الشخصيات الفاخرة</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Executive Wardrobe
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اختر أو اقتنِ شخصيتك القيادية لتمثيل هيبتك ومكانتك الاقتصادية في إمبراطورية الأعمال
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Diamonds Indicator */}
            <div
              onClick={() => onOpenStore && onOpenStore()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs shadow-inner cursor-pointer hover:border-cyan-400 transition"
              title="رصيد الماس الحالي - انقر للشحن"
            >
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span className="tabular-nums font-black">{profile.diamonds ?? 0}</span>
              <span className="text-[10px] text-slate-400 mr-0.5">💎</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({AVATAR_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveTab('men')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'men'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            رجال أعمال 👔
          </button>
          <button
            onClick={() => setActiveTab('women')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'women'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            سيدات أعمال 💼
          </button>
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'owned'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            المملوكة ({AVATAR_CATALOG.filter((a) => isAvatarUnlocked(a.id, unlockedIds)).length})
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30'
                : 'bg-slate-800/80 text-yellow-300 hover:bg-slate-700'
            }`}
          >
            VIP والنخبة 👑
          </button>
        </div>

        {/* Modal Main Content: Split Grid + Preview Drawer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left/Main Column: Grid of Characters */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            {purchaseError && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
                <span>{purchaseError}</span>
                {onOpenStore && (
                  <button
                    onClick={() => {
                      onOpenStore();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black shrink-0 transition"
                  >
                    شحن الماس 💎
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAvatars.map((avatar) => {
                const isUnlocked = isAvatarUnlocked(avatar.id, unlockedIds);
                const isActive = currentAvatarId === avatar.id;
                const isPreview = selectedPreviewId === avatar.id;

                return (
                  <div
                    key={avatar.id}
                    onClick={() => {
                      setSelectedPreviewId(avatar.id);
                      setPurchaseError(null);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                      isPreview
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                        : isUnlocked
                        ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/30 opacity-90'
                    }`}
                  >
                    {/* Active In-Use Pill */}
                    {isActive && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black shadow flex items-center gap-1 z-10">
                        <Check className="w-2.5 h-2.5" />
                        <span>مفعّلة</span>
                      </span>
                    )}

                    {/* Price / Ownership Tag */}
                    <div className="absolute top-2 left-2 z-10">
                      {isUnlocked ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                          مملوكة
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[9px] font-black flex items-center gap-0.5 shadow">
                          <span>{avatar.priceDiamonds}</span>
                          <span className="text-[8px]">💎</span>
                        </span>
                      )}
                    </div>

                    {/* Portrait */}
                    <div className="my-2">
                      <AvatarPortrait avatarId={avatar.id} size="lg" />
                    </div>

                    {/* Name & Title */}
                    <h3 className="text-xs font-black text-white line-clamp-1 mt-1">
                      {avatar.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {avatar.title}
                    </p>

                    {/* Quick Button */}
                    <div className="w-full mt-2.5">
                      {isActive ? (
                        <div className="w-full py-1 text-[10px] rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          صورتك الحالية
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyAvatar(avatar.id);
                          }}
                          className="w-full py-1 text-[10px] rounded-lg bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold transition active:scale-95 cursor-pointer"
                        >
                          تفعيل كصورة شخصية
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyAvatar(avatar);
                          }}
                          className="w-full py-1 text-[10px] rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-sm active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>اقتناء ({avatar.priceDiamonds} 💎)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Selected Character Preview & Philosophy */}
          <div className="lg:col-span-5 xl:col-span-4 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Preview Hero Box */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                <div className="my-2">
                  <AvatarPortrait avatarId={previewAvatar.id} size="2xl" showBorder />
                </div>
                <h3 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
                  <span>{previewAvatar.name}</span>
                  {previewAvatar.tier === 'vip' && <Crown className="w-4 h-4 text-amber-400" />}
                </h3>
                <span className="text-xs font-bold text-amber-400/90 mt-0.5">
                  {previewAvatar.title}
                </span>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                    {previewAvatar.specialty}
                  </span>
                  {isSelectedUnlocked ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>مملوكة لك</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                      <Gem className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{previewAvatar.priceDiamonds} ألماسة</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bio & Specialty */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>الخلفية الاستثمارية والمهنية:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {previewAvatar.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] mb-1">
                    <Quote className="w-3.5 h-3.5" />
                    <span>الفلسفة والرؤية الاقتصادية:</span>
                  </div>
                  <p className="text-slate-300 italic leading-relaxed text-[11px]">
                    «{previewAvatar.quote}»
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer for Selected Preview */}
            <div className="pt-2">
              {isSelectedActive ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs text-center flex items-center justify-center gap-2 shadow-inner">
                  <Check className="w-4 h-4" />
                  <span>صورتك المعتمدة حالياً في جميع شاشات اللعبة</span>
                </div>
              ) : isSelectedUnlocked ? (
                <button
                  onClick={() => handleApplyAvatar(previewAvatar.id)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>اعتماد كصورة للملف الشخصي 👑</span>
                </button>
              ) : (
                <button
                  onClick={() => handleBuyAvatar(previewAvatar)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-lg shadow-cyan-600/30 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gem className="w-4 h-4 text-cyan-200" />
                  <span>اقتناء الشخصية الآن بـ {previewAvatar.priceDiamonds} 💎</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
