import React, { useEffect, useState } from 'react';
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
  getSoundVolume,
  setSoundVolume,
  isMusicPlaying, 
  toggleAmbientMusic, 
  getMusicVolume,
  setMusicVolume,
  playSound 
} from '../game/soundEffects';
import { loadPrestigeData, GLOBAL_CAPITALS } from '../game/prestigeEngine';
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
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Trophy,
  Medal,
  Camera,
  Edit3,
  Quote
} from 'lucide-react';
import { AvatarPortrait } from './AvatarPortrait';
import { getAvatarById, getPlayerRenameStatus, formatTimeRemaining } from '../domain/avatars';
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
  onRestartWalkthrough?: () => void;
  onOpenWardrobe?: () => void;
  onUpdateProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onSaveNow?: () => boolean;
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
  userEmail = '',
  onLinkAccount, 
  onLogout,
  onResetWorld, 
  onAccountDeleted,
  onRestartWalkthrough,
  onOpenWardrobe,
  onUpdateProfile,
  onSaveNow,
}: ProfilePageProps) {
  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saveNowNotice, setSaveNowNotice] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newNameInput, setNewNameInput] = useState(profile.name);
  const [renameNotice, setRenameNotice] = useState<string | null>(null);

  const [showBioModal, setShowBioModal] = useState(false);
  const [bioInput, setBioInput] = useState(profile.bio || 'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.');
  const [bioNotice, setBioNotice] = useState<string | null>(null);

  // Settings audio state
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [soundVol, setSoundVol] = useState(() => Math.round(getSoundVolume() * 100));
  const [musicOn, setMusicOn] = useState(() => isMusicPlaying());
  const [musicVol, setMusicVol] = useState(() => Math.round(getMusicVolume() * 100));

  useEffect(() => {
    if (!showSettingsModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSettingsModal(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showSettingsModal]);

  // Delete account form state
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [policyAgreedCheckbox, setPolicyAgreedCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Copy code feedback
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // Rename weekly limit check
  const renameStatus = getPlayerRenameStatus(profile.renameCountThisWeek, profile.lastRenameWeekTimestamp);

  // Badges filter tab
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const progress = getPlayerProgress(profile);
  const prestige = loadPrestigeData(profile.id);
  const accountCode = accountCodeFromSeed(accountId);
  const badgeCatalog = selectEmpirePulse(profile).badges;
  const earnedBadges = badgeCatalog.filter((badge) => badge.earned);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progress.experienceInLevel / progress.experienceForNextLevel) * 100),
  );

  // Comprehensive Badges Registry & History
  const badgesList = [
    {
      id: 'founder',
      title: 'شارة المؤسس',
      category: 'ريادة الأعمال',
      icon: '🏢',
      description: 'تأسيس أول شركة صناعية أو تجارية وبدء مسار الإنقاذ',
      earned: profile.companies.length > 0 || (profile.badges ?? []).includes('شارة المؤسس'),
      progressText: profile.companies.length > 0 ? 'مكتمل ✓' : '0/1 شركة',
      perk: '+50 XP خبرة قيادية',
    },
    {
      id: 'land_baron',
      title: 'شارة المستثمر العقاري',
      category: 'الأصول العقارية',
      icon: '🏞️',
      description: 'شراء وتملك أول قطعة أرض استثمارية أو صناعية',
      earned: profile.lands.length > 0 || (profile.badges ?? []).includes('شارة المستثمر العقاري'),
      progressText: profile.lands.length > 0 ? 'مكتمل ✓' : '0/1 أرض',
      perk: '+5% سرعة التراخيص',
    },
    {
      id: 'trader',
      title: 'شارة صائد الأسواق',
      category: 'التجارة الحرة',
      icon: '📈',
      description: 'إتمام 3 صفقات بيع بضائع ناجحة على الأقل في البورصة والسوق',
      earned: profile.sales.length >= 3 || (profile.badges ?? []).includes('شارة تاجر الأسواق'),
      progressText: `${Math.min(3, profile.sales.length)}/3 صفقات`,
      perk: '+3% هوامش ربحية',
    },
    {
      id: 'supplier',
      title: 'شارة المورّد المعتمد',
      category: 'العقود والعملاء',
      icon: '📜',
      description: 'تسليم وإتمام أول عقد توريد رسمي لكبار التجار',
      earned: (profile.contracts ?? []).some((c) => c.status === 'completed') || (profile.badges ?? []).includes('شارة المورّد المعتمد'),
      progressText: (profile.contracts ?? []).some((c) => c.status === 'completed') ? 'مكتمل ✓' : '0/1 عقد',
      perk: '+10 نقاط سمعة',
    },
    {
      id: 'banker',
      title: 'شارة الشريك المصرفي',
      category: 'المالية والبنوك',
      icon: '🏦',
      description: 'فتح وديعة استثمارية في البنك أو الحصول على تسهيلات ائتمانية',
      earned: profile.banking.deposits.length > 0 || profile.banking.loans.length > 0,
      progressText: (profile.banking.deposits.length > 0 || profile.banking.loans.length > 0) ? 'مكتمل ✓' : '0/1 معاملة',
      perk: 'تسهيلات ائتمانية مرنة',
    },
    {
      id: 'gold_vault',
      title: 'شارة خازن الذهب',
      category: 'المعادن النفيسة',
      icon: '🥇',
      description: 'حيازة 100 جرام على الأقل من سبائك الذهب الخالص في الخزينة',
      earned: profile.goldGrams >= 100 || (profile.badges ?? []).includes('شارة خازن الذهب'),
      progressText: `${Math.min(100, Math.round(profile.goldGrams))}/100 جم`,
      perk: 'حماية من تقلبات العملة',
    },
    {
      id: 'diamond_wealth',
      title: 'شارة الثري الإمبراطوري',
      category: 'الثروة الفاخرة',
      icon: '💎',
      description: 'حيازة 50 ماسة إمبراطورية أو أكثر في الخزينة السحابية',
      earned: profile.diamonds >= 50 || (profile.badges ?? []).includes('شارة الثري الإمبراطوري'),
      progressText: `${Math.min(50, profile.diamonds)}/50 💎`,
      perk: 'خصومات حصرية بالمتجر',
    },
    {
      id: 'executive_leader',
      title: 'شارة القائد التنفيذي',
      category: 'الكوادر والإدارة',
      icon: '👔',
      description: 'تعيين فريق تنفيذي يضم مديرين أو محاسبين لإدارة الإمبراطورية',
      earned: profile.staff.length >= 2 || (profile.badges ?? []).includes('شارة المدير التنفيذي'),
      progressText: `${Math.min(2, profile.staff.length)}/2 موظفين`,
      perk: '+10% كفاءة التشغيل',
    },
    {
      id: 'industrialist',
      title: 'شارة سيّد الصناعة',
      category: 'الصناعة والتصنيع',
      icon: '⚙️',
      description: 'تشغيل وإتمام أوامر الإنتاج وتحويل الخامات إلى منتجات',
      earned: profile.productionOrders.length >= 2,
      progressText: `${Math.min(2, profile.productionOrders.length)}/2 أوامر`,
      perk: '+5% سرعة خطوط الإنتاج',
    },
    {
      id: 'credit_honor',
      title: 'شارة الأمانة والوفاء البنكي',
      category: 'النزاهة والائتمان',
      icon: '🛡️',
      description: 'سداد الالتزامات والتمويلات المصرفية في موعدها دون تعثر',
      earned: profile.banking.loans.some((l) => l.status === 'paid') || (profile.badges ?? []).includes('شارة الوفاء المصرفي'),
      progressText: profile.banking.loans.some((l) => l.status === 'paid') ? 'مكتمل ✓' : 'سداد أول قرض',
      perk: 'فائدة بنكية تفضيلية',
    },
    {
      id: 'millionaire',
      title: 'شارة المليونير العصامي',
      category: 'السيولة والنقد',
      icon: '💰',
      description: 'تجاوز السيولة النقدية حاجز 1,000,000 $ في حسابك البنكي',
      earned: profile.bankBalance >= 1000000,
      progressText: `${Math.min(1000000, Math.round(profile.bankBalance)).toLocaleString('en-US')} / 1,000,000 $`,
      perk: 'لقب المستثمر المليونير',
    },
    {
      id: 'conglomerate',
      title: 'شارة التكتل الإمبراطوري',
      category: 'التوسع الشامل',
      icon: '👑',
      description: 'امتلاك وتوسيع 3 شركات أو أكثر في قطاعات اقتصادية متعددة',
      earned: profile.companies.length >= 3,
      progressText: `${Math.min(3, profile.companies.length)}/3 شركات`,
      perk: '+15% نقاط هيبة وطنية',
    },
  ];

  const totalBadgesEarned = badgesList.filter((b) => b.earned).length;
  const filteredBadges = badgesList.filter((b) => {
    if (badgeFilter === 'earned') return b.earned;
    if (badgeFilter === 'locked') return !b.earned;
    return true;
  });

  const isReasonValid = deleteReason.trim().length >= 3;
  const isEmailMatching = isGuest || (
    typedEmail.trim().length > 0 &&
    (!userEmail || typedEmail.trim().toLowerCase() === userEmail.trim().toLowerCase())
  );
  const isPasswordValid = isGuest || typedPassword.length >= 6;
  const canConfirmDelete = (
    isReasonValid &&
    confirmedCheckbox &&
    policyAgreedCheckbox &&
    isPasswordValid &&
    (isGuest || typedEmail.trim().length > 0) &&
    !isDeleting
  );

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleSoundVolumeChange = (volPercent: number) => {
    setSoundVol(volPercent);
    setSoundVolume(volPercent / 100);
  };

  const handleToggleMusic = () => {
    const next = toggleAmbientMusic();
    setMusicOn(next);
  };

  const handleMusicVolumeChange = (volPercent: number) => {
    setMusicVol(volPercent);
    setMusicVolume(volPercent / 100);
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

  const handleOpenDeleteModal = () => {
    playSound('click');
    setTypedEmail('');
    setTypedPassword('');
    setShowPassword(false);
    setDeleteReason('');
    setConfirmedCheckbox(false);
    setPolicyAgreedCheckbox(false);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteAccountStrict = async () => {
    if (!canConfirmDelete) return;

    if (!isGuest && userEmail && typedEmail.trim().toLowerCase() !== userEmail.trim().toLowerCase()) {
      setDeleteError('البريد الإلكتروني المكتوب لا يتطابق مع الحساب المسجل.');
      return;
    }

    playSound('click');
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await deleteCurrentAccount({
        isGuest,
        email: isGuest ? undefined : typedEmail.trim().toLowerCase(),
        password: isGuest ? undefined : typedPassword,
      });

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

  const handleRenameSubmit = () => {
    const trimmed = newNameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      playSound('error');
      setRenameNotice('يرجى إدخال اسم استثماري صالح (حرفان على الأقل).');
      return;
    }
    if (trimmed === profile.name) {
      setShowRenameModal(false);
      return;
    }
    if (!renameStatus.canRename) {
      playSound('error');
      setRenameNotice(`استنفدت مرات التعديل (2 من 2) هذا الأسبوع. يمكنك التعديل مجدداً بعد ${formatTimeRemaining(renameStatus.timeUntilResetMs)}.`);
      return;
    }

    const now = Date.now();
    const nextCount = renameStatus.isNewWeek ? 1 : (profile.renameCountThisWeek || 0) + 1;
    const nextTimestamp = renameStatus.isNewWeek ? now : (profile.lastRenameWeekTimestamp || now);

    if (onUpdateProfile) {
      onUpdateProfile((prev) => ({
        ...prev,
        name: trimmed,
        renameCountThisWeek: nextCount,
        lastRenameWeekTimestamp: nextTimestamp,
      }));
    }
    playSound('success');
    setShowRenameModal(false);
    setCopyMessage(`تم تعديل الاسم الاستثماري بنجاح إلى "${trimmed}"! ✓`);
    setTimeout(() => setCopyMessage(null), 3500);
  };

  const handleBioSubmit = () => {
    const trimmed = bioInput.trim();
    if (!trimmed) {
      setBioNotice('يرجى كتابة شعار أو مقولة استثمارية تعبر عن رؤيتك.');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile((prev) => ({
        ...prev,
        bio: trimmed,
      }));
    }
    playSound('success');
    setShowBioModal(false);
    setCopyMessage('تم حفظ الشعار والبيان الاستثماري بنجاح! ✓');
    setTimeout(() => setCopyMessage(null), 3500);
  };

  const activeAvatar = getAvatarById(profile.avatarId);

  return (
    <main className="space-y-6 max-w-5xl mx-auto py-2 pb-14 animate-fade-in" dir="rtl">
      {/* 1. VIP Executive Hero Card with Compact Level, Wardrobe & Bio */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10">
          {/* Identity Left Column */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar Ring with Quick Wardrobe Trigger */}
            <div className="relative group cursor-pointer" onClick={() => onOpenWardrobe && onOpenWardrobe()}>
              <AvatarPortrait
                avatarId={profile.avatarId}
                size="2xl"
                showBorder
                className="group-hover:scale-105 transition-transform"
              />
              <button
                type="button"
                className="absolute -bottom-1 -left-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg border-2 border-slate-950 flex items-center gap-1 transition active:scale-95 cursor-pointer"
                title="فتح خزانة واختيار صور الشخصيات الفاخرة"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenWardrobe) onOpenWardrobe();
                }}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">تغيير الصورة</span>
              </button>
            </div>

            {/* Investor Name & Compact Level Badge */}
            <div className="space-y-1.5 text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {profile.name}
                </h1>
                <span className="text-slate-400 font-bold">•</span>
                {/* Compact Level Badge */}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold tabular-nums">
                  مستوى {progress.level}
                </span>
                {prestige.prestigeLevel > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-extrabold flex items-center gap-1">
                    👑 هيبة {prestige.prestigeLevel} ({GLOBAL_CAPITALS.find((c) => c.id === prestige.currentCapitalId)?.name || 'عالمي'})
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  👑 مستثمر معتمد
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span>•</span>
                <span className="text-amber-400/90 font-medium">{activeAvatar.name} ({activeAvatar.title})</span>
              </div>

              {/* Fast Identity Action Buttons (Wardrobe & Rename 2/week) */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenWardrobe && onOpenWardrobe()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>خزانة الشخصيات</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setNewNameInput(profile.name);
                    setRenameNotice(null);
                    setShowRenameModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                  title="تعديل الاسم الاستثماري (مرتان أسبوعياً)"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعديل الاسم</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 font-mono border border-slate-700">
                    {renameStatus.remainingRenames}/2 أسبوعياً
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Right Action Tools: Settings Icon & Copy ID */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-start">
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

        {/* 3. Investor Bio / الشعار والبيان الاستثماري (Investor Bio) */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/85 border border-amber-500/25 relative">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Quote className="w-4 h-4" />
              <span>الشعار والبيان الاستثماري (Investor Bio)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setBioInput(profile.bio || 'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.');
                setBioNotice(null);
                setShowBioModal(true);
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer transition"
            >
              <Edit3 className="w-3 h-3" />
              <span>تعديل الشعار</span>
            </button>
          </div>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            «{profile.bio || 'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.'}»
          </p>
        </div>

        {copyMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{copyMessage}</span>
          </div>
        )}
      </section>

      {/* 2. Google / Email Connection Banner */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-xl font-bold ${
              isGuest 
                ? 'bg-slate-800 text-amber-400 border border-slate-700' 
                : 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white shadow-blue-500/20'
            }`}>
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">حالة الاتصال بالسحابة:</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isGuest 
                    ? 'text-amber-400 bg-amber-950/60 border border-amber-500/40' 
                    : 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isGuest ? 'حساب ضيف (غير مرتبط)' : 'متصل ومُزامن'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 flex items-center gap-2 flex-wrap">
                {isGuest ? (
                  <>
                    <span>نوع الحساب الحالي:</span>
                    <span className="text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/30 text-xs sm:text-sm font-bold">
                      حساب ضيف محلي (غير مسجل ببريد)
                    </span>
                  </>
                ) : (
                  <>
                    <span>البريد الإلكتروني المسجل:</span>
                    <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-500/30 text-xs sm:text-sm">
                      {userEmail || 'حساب سحابي متصل'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-left text-xs text-slate-400 shrink-0">
            {isGuest ? (
              <button
                type="button"
                onClick={onLinkAccount}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer"
              >
                ربط بحساب سحابي ☁️
              </button>
            ) : (
              <>
                <span className="block text-[11px] text-slate-500">حفظ تلقائي سحابي مشفر</span>
                <span className="font-semibold text-emerald-400">✓ خوادم الحفظ النشطة</span>
              </>
            )}
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

      {/* 5. شارات الإمبراطورية وسجل الإنجازات (Badges & Milestones Record) */}
      <section className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  شارات الإمبراطورية وسجل الإنجازات
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                  {totalBadgesEarned} / {badgesList.length} مكتسبة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                سجل الأوسمة والشارات الفخرية التي توثق نمو إمبراطوريتك ومحطات نجاحك
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                badgeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({badgesList.length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('earned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                badgeFilter === 'earned'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>المكتسبة 🏆</span>
              <span>({totalBadgesEarned})</span>
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('locked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                badgeFilter === 'locked'
                  ? 'bg-slate-700 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>قيد العمل 🔒</span>
              <span>({badgesList.length - totalBadgesEarned})</span>
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-5 relative z-10">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                badge.earned
                  ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/25 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow ${
                      badge.earned 
                        ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40' 
                        : 'bg-slate-800/60 border border-slate-700/60 grayscale'
                    }`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs sm:text-sm font-black ${badge.earned ? 'text-white' : 'text-slate-300'}`}>
                        {badge.title}
                      </h3>
                      <span className="text-[10px] text-amber-400/90 font-medium block">
                        {badge.category}
                      </span>
                    </div>
                  </div>

                  {badge.earned ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" />
                      مكتسبة
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3" />
                      قيد العمل
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {badge.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>الميزة:</span>
                  <strong className={badge.earned ? 'text-amber-300' : 'text-slate-400'}>
                    {badge.perk}
                  </strong>
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${
                  badge.earned 
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {badge.progressText}
                </span>
              </div>
            </div>
          ))}
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
            className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-7 text-slate-100 shadow-2xl"
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

              {/* Sound FX Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${soundOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm text-white block">المؤثرات الصوتية (Sound FX)</strong>
                      <span className="text-[10px] text-slate-400">أصوات النقود، إتمام الصفقات، والترقيات</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${soundOn ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${soundOn ? 'translate-x-1' : 'translate-x-6'}`} />
                  </button>
                </div>

                {soundOn && (
                  <div className="pt-2 border-t border-slate-850 space-y-2">
                    {/* Volume Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-300 font-bold shrink-0">شدة الصوت:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={soundVol}
                        onChange={(e) => handleSoundVolumeChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-[11px] font-mono font-bold text-amber-300 w-9 text-left">
                        {soundVol}%
                      </span>
                    </div>

                    {/* Preview Buttons Grid */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 self-center ml-1">تجربة:</span>
                      <button
                        type="button"
                        onClick={() => playSound('cash')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="رنين الكاش والأرباح"
                      >
                        💵 كاش
                      </button>
                      <button
                        type="button"
                        onClick={() => playSound('gold')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-yellow-400 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="طنين سبائك الذهب"
                      >
                        🥇 ذهب
                      </button>
                      <button
                        type="button"
                        onClick={() => playSound('diamond')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="بريق الألماس"
                      >
                        💎 ألماس
                      </button>
                      <button
                        type="button"
                        onClick={() => playSound('maintenance')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="صيانة وتروس المصانع"
                      >
                        ⚙️ صيانة
                      </button>
                      <button
                        type="button"
                        onClick={() => playSound('auction')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="مطرقة المزاد"
                      >
                        🔨 مزاد
                      </button>
                      <button
                        type="button"
                        onClick={() => playSound('vip')}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 text-[10px] font-bold border border-slate-800 transition active:scale-95"
                        title="عزف إمبراطوري فاخر"
                      >
                        👑 ترقية
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ambient Music Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${musicOn ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm text-white block">الموسيقى التصويرية الهادئة</strong>
                      <span className="text-[10px] text-slate-400">أنغام استثمارية Lo-Fi هادئة ومريحة في الخلفية</span>
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

                {musicOn && (
                  <div className="pt-2 border-t border-slate-850">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-300 font-bold shrink-0">شدة الموسيقى:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVol}
                        onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                      <span className="text-[11px] font-mono font-bold text-purple-300 w-9 text-left">
                        {musicVol}%
                      </span>
                    </div>
                  </div>
                )}
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

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs sm:text-sm block text-white">حفظ التقدم الآن</strong>
                    <span className="text-[10px] text-slate-400">يحفظ الموارد والمهام والأيام والأصول على هذا الجهاز فورًا.</span>
                  </div>
                  <button type="button" className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs" onClick={() => {
                    const ok = onSaveNow?.() ?? false;
                    setSaveNowNotice(ok ? 'تم حفظ التقدم محليًا بنجاح ✓' : 'فشل الحفظ المحلي؛ لم يتم اعتماد التغيير.');
                  }}>حفظ الآن</button>
                </div>
                {saveNowNotice && <span className={`text-[10px] ${saveNowNotice.startsWith('تم') ? 'text-emerald-300' : 'text-rose-300'}`}>{saveNowNotice}</span>}
              </div>

              {onRestartWalkthrough && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setShowSettingsModal(false);
                      onRestartWalkthrough();
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-400/20 border-2 border-amber-400/60 text-amber-300 hover:text-amber-200 flex items-center justify-between transition cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <strong className="text-xs sm:text-sm block text-white">إعادة تشغيل الجولة الإرشادية الإلزامية 🎯</strong>
                        <span className="text-[10px] text-amber-200/80">تجميد الشاشة وتسليط الضوء الإرشادي للتدريب خطوة بخطوة</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-950 font-black bg-amber-400 px-2.5 py-1 rounded-lg">بدء ➔</span>
                  </button>
                </div>
              )}
              {/* Account Actions Section inside Settings (تسجيل الخروج وحذف الحساب) */}
              <div className="pt-2 space-y-2 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-1">
                  إدارة الجلسة والحساب:
                </span>

                {/* Logout Option in Settings */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setShowSettingsModal(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <strong className="text-xs sm:text-sm block">
                        {isGuest ? 'إنهاء جلسة الضيف' : 'تسجيل الخروج من الحساب'}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {isGuest ? 'حفظ محلي فقط على هذا الجهاز' : 'إنهاء الجلسة والعودة لاحقاً'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    خروج ↩
                  </span>
                </button>

                {/* Delete Account Option in Settings */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setShowSettingsModal(false);
                    handleOpenDeleteModal();
                  }}
                  className="w-full p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-rose-200 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <strong className="text-xs sm:text-sm block text-rose-300">
                        {isGuest ? 'حذف حساب الضيف والبدء من جديد' : 'حذف الحساب نهائياً'}
                      </strong>
                      <span className="text-[10px] text-rose-400/80">
                        {isGuest ? 'محو بيانات اللعبة وإعادة ضبط من الصفر' : 'محو كافة البيانات والأصول والشركات'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-400 font-bold bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/40">
                    حذف 🗑️
                  </span>
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 pt-3 border-t border-slate-800 bg-slate-900/95 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                aria-label="إغلاق الإعدادات والعودة إلى اللعبة"
              >
                إغلاق الإعدادات والعودة إلى اللعبة ✓
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
                <h3 className="font-extrabold text-base text-white">
                  {isGuest ? 'تأكيد إنهاء جلسة الضيف' : 'تأكيد تسجيل الخروج'}
                </h3>
                <span className="text-xs text-slate-400">
                  {isGuest ? 'جلسة محلية على هذا الجهاز' : 'ستظل إمبراطوريتك محفوظة بالسحابة'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {isGuest ? (
                <>هل أنت متأكد من رغبتك في إنهاء جلسة الضيف الحالية؟ يمكنك ربط حسابك لحفظ تقدمك بالسحابة، أو بدء إمبراطورية جديدة في أي وقت.</>
              ) : (
                <>
                  هل أنت متأكد من رغبتك في تسجيل الخروج الآن؟
                  <br />
                  {userEmail ? (
                    <>حسابك مرتبط بـ <strong className="text-amber-300 font-mono">{userEmail}</strong>، ويمكنك العودة في أي وقت ومتابعة بناء إمبراطوريتك.</>
                  ) : (
                    <>يمكنك العودة في أي وقت وتسجيل الدخول لمتابعة بناء إمبراطوريتك.</>
                  )}
                </>
              )}
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
      {/* MODAL 3: DELETE ACCOUNT CONFIRMATION MODAL                                */}
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
                  {isGuest ? 'حذف حساب الضيف وإعادة ضبط اللعبة' : 'تأكيد أمان مشدد: حذف الحساب نهائياً'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isGuest 
                    ? 'محو بيانات اللعبة المحلية والموافقة على الشروط والسياسة للبدء من الصفر'
                    : 'يرجى كتابة بيانات حسابك والموافقة على الشروط والسياسة لإتمام الحذف'}
                </span>
              </div>
            </div>

            {/* Warning Message Box */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs leading-relaxed mb-4">
              {isGuest ? (
                <>
                  <strong>⚠️ تنبيه لحساب الضيف:</strong> أنت تلعب بحساب محلي غير مسجل بسحابة. سيتم محو جميع أموالك، الشركات، والممتلكات من ذاكرة هذا الجهاز نهائياً ولن تتمكن من استعادتها.
                </>
              ) : (
                <>
                  <strong>⚠️ تنبيه نهائي:</strong> سيتم محو جميع أصولك النقدية، سبائك الذهب، الشركات، الأراضي، وجميع إنجازاتك من السحابة دون أي إمكانية للاسترداد.
                </>
              )}
            </div>

            {/* Validation Fields */}
            <div className="space-y-4">
              {/* REGISTERED USER: Requires manual Email and Password */}
              {!isGuest && (
                <>
                  {/* Field 1: Enter Email Manually - NO SUGGESTION OR PREFILLED TEXT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>1. اكتب بريدك الإلكتروني المسجل:</span>
                      <span className="text-[10px] text-slate-400 font-normal">اكتبه بنفسك للتأكيد</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        dir="ltr"
                        placeholder="name@example.com"
                        value={typedEmail}
                        onChange={(e) => setTypedEmail(e.target.value)}
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none transition ${
                          typedEmail.length > 0
                            ? isEmailMatching ? 'border-emerald-500 text-emerald-300' : 'border-slate-700'
                            : 'border-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Field 2: Enter Password to confirm identity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>2. اكتب كلمة مرور حسابك لتأكيد الملكية:</span>
                      <span className="text-[10px] text-slate-400 font-normal">مطلوبة لمنع الحذف العشوائي</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        placeholder="اكتب كلمة المرور الخاصة بحسابك"
                        value={typedPassword}
                        onChange={(e) => setTypedPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white focus:outline-none transition font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                        title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* GUEST USER INFO BADGE */}
              {isGuest && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs flex items-center gap-2.5">
                  <span className="text-base">👤</span>
                  <div>
                    <strong className="text-white block mb-0.5">حساب ضيف (غير مسجل ببريد)</strong>
                    <span className="text-[11px] text-slate-400">
                      لا يتطلب كتابة بريد أو كلمة مرور، ويلزم فقط الموافقة على الشروط والسياسة أدناه.
                    </span>
                  </div>
                </div>
              )}

              {/* Deletion Reason (Required for both) */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  {isGuest ? '1. سبب حذف حساب الضيف والبدء من جديد (مطلوب):' : '3. سبب طلب حذف الحساب (مطلوب):'}
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
                    يرجى كتابة سبب واضح (3 أحرف على الأقل).
                  </span>
                )}
              </div>

              {/* Approval Checkbox 1: Acknowledge irreversible wipe */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={confirmedCheckbox}
                  onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-normal select-none">
                  {isGuest 
                    ? 'أقر برغبتي في مسح بيانات حساب الضيف وجميع ممتلكاتي من هذا الجهاز وبدء إمبراطورية جديدة بلا رجعة.'
                    : 'أقر بكامل إرادتي ومسؤوليتي برغبتي في مسح هذا الحساب وجميع ممتلكاته نهائياً من السحابة وبلا رجعة.'}
                </span>
              </label>

              {/* Approval Checkbox 2: Terms and Privacy Policy ("لازم يجيبون موافقات علي شروط والسياسه") */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyAgreedCheckbox}
                    onChange={(e) => setPolicyAgreedCheckbox(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 leading-normal select-none">
                    أوافق على شروط الاستخدام وسياسة الخصوصية الخاصة باللعبة وأقر بأن إجراء الحذف نهائي ومسؤوليتي التامة.
                  </span>
                </label>
                <div className="pr-6 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-amber-400 hover:text-amber-300 underline text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>📜 قراءة شروط الخدمة وسياسة الخصوصية</span>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {deleteError && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs leading-relaxed animate-fade-in flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                disabled={!canConfirmDelete}
                onClick={handleDeleteAccountStrict}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-rose-950/40 transition cursor-pointer"
              >
                {isDeleting 
                  ? (isGuest ? 'جارٍ محو بيانات الضيف...' : 'جارٍ التحقق ومحو الحساب...')
                  : (isGuest ? 'تأكيد وحذف حساب الضيف والبدء من جديد 🗑️' : 'تأكيد وحذف الحساب نهائياً 🗑️')}
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

      {/* Modal 5: Edit Investor Name (Strict 2/week limit) */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">تعديل الاسم الاستثماري</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Weekly Counter Badge */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">الرصيد الأسبوعي للتعديل:</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-black border tabular-nums ${
                renameStatus.canRename
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                متبقي {renameStatus.remainingRenames} من 2 هذا الأسبوع
              </span>
            </div>

            {!renameStatus.canRename ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>تم بلوغ الحد الأقصى الأسبوعي (مرتان)</span>
                </div>
                <p>
                  لضمان ثبات الهوية الاستثمارية وحماية لوائح المتصدرين والسجلات التجارية، يُسمح بتغيير الاسم مرتين أسبوعياً فقط.
                </p>
                <div className="text-[11px] font-mono font-bold text-amber-400 bg-slate-950/60 p-2 rounded-xl text-center">
                  يتجدد الرصيد بعد: {formatTimeRemaining(renameStatus.timeUntilResetMs)}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  الاسم الاستثماري الجديد:
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  placeholder="مثال: كريم المنشاوي، نور القابضة..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400">
                  ⚠️ سيتم استهلاك محاولة واحدة من رصيدك الأسبوعي فور التأكيد.
                </p>
              </div>
            )}

            {renameNotice && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {renameNotice}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!renameStatus.canRename}
                onClick={handleRenameSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                حفظ وتحديث الاسم ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Edit Investor Bio & Vision */}
      {showBioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                  <Quote className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">تخصيص الشعار والرؤية الاستثمارية</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBioModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>بيانك وشعارك الاستثماري (Investor Bio):</span>
                <span className="text-slate-500 font-mono text-[11px]">{bioInput.length}/160</span>
              </div>
              <textarea
                maxLength={160}
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="اكتب شعارك الاستثماري وفلسفتك في قيادة إمبراطوريتك..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Quick Inspiration Slogans */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-amber-400 font-bold block">
                💡 شعارات استثمارية ملهمة ومقترحة:
              </span>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {[
                  'ابنِ إمبراطوريتك الاستثمارية بعزيمة لا تلين ورؤية لا تعرف المستحيل.',
                  'الفرص تصنعها القرارات الجريئة والتنفيذ المنضبط والسيولة الذكية.',
                  'في عالم المال والأعمال: من يملك المعلومة والشجاعة يملك المستقبل.',
                  'إمبراطورية صناعية وتجارية تُبنى حجراً بحجر وعقداً بعد عقد.',
                  'السيادة الاقتصادية ليست حظاً، بل استراتيجية استثمارية متكاملة.'
                ].map((slogan, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBioInput(slogan)}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 text-right transition hover:text-white"
                  >
                    «{slogan}»
                  </button>
                ))}
              </div>
            </div>

            {bioNotice && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {bioNotice}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBioModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBioSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                حفظ الشعار الاستثماري ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
