import React from 'react';
import { X, Trophy } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { GlobalLeaderboardCard } from './GlobalLeaderboardCard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  country: CountryDefinition;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl" onClick={onClose}>
      <div className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl overflow-y-auto max-h-[92vh]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center"><Trophy className="w-5 h-5" /></div><div><h3 className="font-black text-lg text-white">المتصدرون الحقيقيون</h3><p className="text-xs text-slate-400">بيانات مستخدمي اللعبة المعتمدة من الخادم</p></div></div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>
        <GlobalLeaderboardCard cacheScope={profile.id} />
      </div>
    </div>
  );
};
