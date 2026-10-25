import React, { useState } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { accountCodeFromSeed } from '../domain/accountFeatures';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';
import { selectEmpirePulse } from '../game/selectors';
import { deleteCurrentAccount } from '../storage/authRepository';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  isMusicPlaying, 
  toggleAmbientMusic, 
  playSound 
} from '../game/soundEffects';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Music, 
  LogOut, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Check, 
  Copy, 
  Crown, 
  Building2, 
  Coins, 
  Gem, 
  Clock, 
  Target, 
  Award,
  Sparkles
} from 'lucide-react';
import './ProfilePage.css';

interface ProfilePageProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  accountId: string;
  isGuest: boolean;
  isSynced: boolean;
  userEmail?: string;
  onLinkAccount: () => void;
  onLogout?: () => void;
  onResetWorld?: () => void;
  onAccountDeleted?: () => void;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.right = '-10000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export function ProfilePage({ 
  profile, 
  country, 
  accountId, 
  isGuest, 
  isSynced, 
  userEmail = 'samopmohamed7@gmail.com',
  onLinkAccount, 
  onLogout,
  onResetWorld, 
  onAccountDeleted 
}: ProfilePageProps) {
  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Settings audio state
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [musicOn, setMusicOn] = useState(() => isMusicPlaying());

  // Delete account strict form state
  const [typedEmail, setTypedEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Copy code feedback
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const progress = getPlayerProgress(profile);
  const accountCode = accountCodeFromSeed(accountId);
  const badgeCatalog = selectEmpirePulse(profile).badges;
  const earnedBadges = badgeCatalog.filter((badge) => badge.earned);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progress.experienceInLevel / progress.experienceForNextLevel) * 100),
  );

  const normalizedUserEmail = userEmail || 'samopmohamed7@gmail.com';
  const isEmailMatching = typedEmail.trim().toLowerCase() === normalizedUserEmail.trim().toLowerCase();
  const isReasonValid = deleteReason.trim().length >= 5;
  const canConfirmDelete = isEmailMatching && isReasonValid && confirmedCheckbox && !isDeleting;

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleToggleMusic = () => {
    const next = toggleAmbientMusic();
    setMusicOn(next);
  };

  const handleCopyCode = async () => {
    playSound('click');
    const ok = await copyTextWithFallback(accountCode);
    setCopyMessage(ok ? 'تم نسخ معرف اللاعب بنجاح! ✓' : 'تعذر النسخ.');
    setTimeout(() => setCopyMessage(null), 3000);
  };

  const handleConfirmLogout = () => {
    playSound('click');
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const handleDeleteAccountStrict = async () => {
    if (!canConfirmDelete) return;
    playSound('click');
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await deleteCurrentAccount();
      setIsDeleting(false);
      if (!res.ok) {
        setDeleteError(res.message || 'تعذر حذف الحساب.');
        return;
      }
      setShowDeleteModal(false);
      if (onAccountDeleted) {
        onAccountDeleted();
      } else if (onResetWorld) {
        onResetWorld();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err instanceof Error ? err.message : 'حدث خطأ أثناء محاولة الحذف.');
    }
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto py-2 pb-14 animate-fade-in" dir="rtl">
      {/* 1. VIP Executive Hero Card with Settings Icon */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar Ring */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-xl shadow-amber-500/25 flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-amber-400 text-2xl sm:text-3xl font-black">
                  {profile.name.trim().charAt(0) || 'م'}
                </div>
              </div>
              <span className="absolute -bottom-1.5 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow">
                Lvl {progress.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {profile.name}
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  👑 مستثمر معتمد
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span>•</span>
                <span className="text-amber-400/90 font-medium">قائد إمبراطورية الأعمال</span>
              </div>
            </div>
          </div>

          {/* Top Right Action Tools: Settings Icon & Copy ID */}
          <div className="flex items-center gap-2.5">
            {/* SETTINGS ICON BUTTON */}
            <button
              onClick={() => {
                playSound('click');
                setShowSettingsModal(true);
              }}
              className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 shadow-md transition flex items-center gap-2 cursor-pointer group"
              title="الإعدادات والتفضيلات الصوتية"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-xs font-bold text-slate-200">الإعدادات</span>
            </button>

            {/* Account Code Chip */}
            <button
              onClick={handleCopyCode}
              className="p-2.5 sm:px-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition flex items-center gap-2 cursor-pointer"
              title="نسخ معرف اللاعب"
            >
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block">معرف الحساب</span>
                <code className="text-xs font-mono font-bold text-amber-300">{accountCode}</code>
              </div>
              <Copy className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {copyMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{copyMessage}</span>
          </div>
        )}
      </section>

      {/* 2. Google / Email Connection Banner (المتصل بالجميل) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 text-xl font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">حالة الاتصال بالسحابة:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  متصل ومُزامن
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 flex items-center gap-2 flex-wrap">
                <span>متصل بحساب Google (الجميل):</span>
                <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                  {normalizedUserEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left text-xs text-slate-400 shrink-0">
            <span className="block text-[11px] text-slate-500">حفظ تلقائي سحابي مشفر</span>
            <span className="font-semibold text-emerald-400">✓ خوادم الحفظ النشطة</span>
          </div>
        </div>
      </section>

      {/* 3. Level & XP Progress Card */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>المستوى {formatNumber(progress.level)}</span>
          </div>
          <span className="text-slate-400">
            إجمالي نقاط الخبرة: <strong className="text-amber-300 font-mono">{formatNumber(progress.totalExperience)} XP</strong>
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-left">
          متبقي {formatNumber(progress.experienceForNextLevel - progress.experienceInLevel)} XP للوصول للمستوى القادم ({Math.round(progressPercent)}%)
        </p>
      </section>

      {/* 4. Empire Assets Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            السيولة النقدية
          </span>
          <strong className="text-sm sm:text-base font-black text-emerald-400 font-mono">
            {formatMoney(profile.bankBalance, country)}
          </strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            سبائك الذهب
          </span>
          <strong className="text-sm sm:text-base font-black text-yellow-300 font-mono">
            {formatGold(profile.goldGrams)}
          </strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            الماس الإمبراطوري
          </span>
          <strong className="text-sm sm:text-base font-black text-cyan-300 font-mono">
            {formatNumber(profile.diamonds)} 💎
          </strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            الشركات التابعة
          </span>
          <strong className="text-sm sm:text-base font-black text-white font-mono">
            {formatNumber(profile.companies.length)} شركات
          </strong>
        </div>
      </section>

      {/* 5. Separate Side-by-Side Cards: Logout (تسجيل خروج) and Delete Account (حذف الحساب) */}
      <section className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SIDE A: LOGOUT CARD */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    تسجيل الخروج من الجلسة
                  </h3>
                  <small className="text-[11px] text-slate-400">إنهاء الجلسة الحالية بأمان</small>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                بيانات إمبراطوريتك وتقدمك محفوظة بالسحابة باسم <strong className="text-slate-200 font-mono">{normalizedUserEmail}</strong>. يمكنك العودة وتسجيل الدخول في أي وقت.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowLogoutModal(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>

          {/* SIDE B: DELETE ACCOUNT CARD */}
          <div className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    منطقة الخطر: حذف الحساب
                  </h3>
                  <small className="text-[11px] text-rose-400">إجراء نهائي لمحو البيانات والأصول</small>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                حذف الحساب سيمحو جميع الشركات، الأراضي، الأرصدة، والمعرفات نهائياً بلا رجعة من خوادمنا. يتطلب تأكيداً مشدداً وكتابة سبب الحذف.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setTypedEmail('');
                setDeleteReason('');
                setConfirmedCheckbox(false);
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 font-bold text-xs sm:text-sm border border-rose-500/40 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>حذف الحساب والبيانات نهائياً</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: SETTINGS MODAL (الإعدادات والتفضيلات الصوتية)                     */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" 
          dir="rtl"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">إعدادات وتفضيلات اللعبة</h3>
                  <small className="text-xs text-slate-400">التحكم في الصوت، الموسيقى، وبيئة اللعب</small>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Settings Section */}
            <div className="py-4 space-y-4">
              <span className="text-xs font-bold text-amber-400 block mb-1">
                الصوت والمؤثرات الصوتية:
              </span>

              {/* Sound FX Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${soundOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm text-white block">المؤثرات الصوتية (Sound FX)</strong>
                    <span className="text-[10px] text-slate-400">أصوات النقود، إتمام الصفقات، والترقيات</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {soundOn && (
                    <button
                      type="button"
                      onClick={() => playSound('cash')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold transition"
                    >
                      تجربة 🔔
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${soundOn ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${soundOn ? 'translate-x-1' : 'translate-x-6'}`} />
                  </button>
                </div>
              </div>

              {/* Ambient Music Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${musicOn ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm text-white block">الموسيقى التصويرية الهادئة</strong>
                    <span className="text-[10px] text-slate-400">أنغام استثمارية Lo-Fi هادئة في الخلفية</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${musicOn ? 'bg-purple-500' : 'bg-slate-700'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${musicOn ? 'translate-x-1' : 'translate-x-6'}`} />
                </button>
              </div>

              {/* System Info */}
              <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>إصدار اللعبة:</span>
                  <strong className="text-slate-200">v2.5 (نسخة المحاكاة الاقتصادية)</strong>
                </div>
                <div className="flex justify-between">
                  <span>البيئة المشغلة:</span>
                  <strong className="text-slate-200">AI Studio Web Edition</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
              >
                تم الحفظ والإغلاق ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOGOUT CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" 
          dir="rtl"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">تأكيد تسجيل الخروج</h3>
                <span className="text-xs text-slate-400">ستظل إمبراطوريتك محفوظة بالسحابة</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              هل أنت متأكد من رغبتك في تسجيل الخروج الآن؟
              <br />
              حسابك مرتبط بـ <strong className="text-amber-300 font-mono">{normalizedUserEmail}</strong>، ويمكنك العودة في أي وقت ومتابعة بناء إمبراطوريتك.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition"
              >
                نعم، تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STRICT DELETE ACCOUNT CONFIRMATION MODAL                         */}
      {/* ========================================================================= */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" 
          dir="rtl"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-rose-500/50 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl overflow-y-auto max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 pb-3 mb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-rose-400">
                  تأكيد أمان مشدد: حذف الحساب نهائياً
                </h3>
                <span className="text-[11px] text-slate-400">
                  يرجى قراءة التعليمات بعناية وكتابة البيانات المطلوبة
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs leading-relaxed mb-4">
              <strong>⚠️ تنبيه نهائي:</strong> سيتم محو جميع أصولك النقدية، سبائك الذهب، الشركات، الأراضي، وجميع إنجازاتك من السحابة دون أي إمكانية للاسترداد.
            </div>

            {/* Validation Fields */}
            <div className="space-y-4">
              {/* Field 1: Enter Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. اكتب بريدك الإلكتروني للتأكيد:
                </label>
                <div className="text-[11px] text-slate-400 mb-1.5">
                  البريد المطلوب مطابقته: <code className="text-cyan-300 font-mono select-all">{normalizedUserEmail}</code>
                </div>
                <input
                  type="email"
                  dir="ltr"
                  placeholder={normalizedUserEmail}
                  value={typedEmail}
                  onChange={(e) => setTypedEmail(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none transition ${
                    typedEmail.length > 0
                      ? isEmailMatching ? 'border-emerald-500 text-emerald-300' : 'border-rose-500'
                      : 'border-slate-800'
                  }`}
                />
                {typedEmail.length > 0 && !isEmailMatching && (
                  <span className="text-[10px] text-rose-400 block mt-1">
                    البريد المكتوب غير متطابق. يرجى كتابة البريد بدقة.
                  </span>
                )}
              </div>

              {/* Field 2: Reason for Deletion */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. سبب طلب حذف الحساب (مطلوب):
                </label>
                <textarea
                  rows={2}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="اكتب سبب طلب الحذف هنا (مثال: رغبة في إعادة البدء من الصفر، إلغاء الحساب...)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition resize-none"
                />
                {deleteReason.length > 0 && !isReasonValid && (
                  <span className="text-[10px] text-amber-400 block mt-0.5">
                    يرجى كتابة سبب واضح (5 أحرف على الأقل).
                  </span>
                )}
              </div>

              {/* Field 3: Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedCheckbox}
                  onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-slate-300 leading-normal select-none">
                  أقر بكامل إرادتي ومسؤوليتي برغبتي في مسح هذا الحساب وجميع ممتلكاته نهائياً من السحابة وبلا رجعة.
                </span>
              </label>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                disabled={!canConfirmDelete}
                onClick={handleDeleteAccountStrict}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-rose-950/40 transition cursor-pointer"
              >
                {isDeleting ? 'جارٍ محو الحساب...' : 'تأكيد وحذف الحساب نهائياً 🗑️'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Privacy Policy */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </main>
  );
}
