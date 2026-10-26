import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { formatMoney, formatNumber } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import { getPlayerProgress } from '../game/onboarding';
import { 
  Building2, 
  Factory, 
  Landmark, 
  Warehouse, 
  ShieldCheck, 
  FlaskConical, 
  HardHat, 
  Swords, 
  Hammer, 
  Sparkles, 
  X, 
  ArrowUpCircle, 
  Zap, 
  Coins, 
  TrendingUp, 
  ExternalLink,
  Users,
  Compass
} from 'lucide-react';
import './ClashVillageHub.css';

interface ClashVillageHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onSwitchToClassic: () => void;
}

interface VillageBuilding {
  id: string;
  name: string;
  category: 'hq' | 'factory' | 'vault' | 'warehouse' | 'builders' | 'defense' | 'rnd' | 'expansion';
  level: number;
  icon: string;
  role: string;
  description: string;
  stats: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
  };
  upgradeCost: number;
  upgradeDiamonds?: number;
  targetSection: SectionId;
  readyProfit?: number;
}

export function ClashVillageHub({
  profile,
  country,
  onNavigate,
  onUpdateProfile,
  onSwitchToClassic,
}: ClashVillageHubProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<VillageBuilding | null>(null);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [shopTab, setShopTab] = useState<'resources' | 'production' | 'defense' | 'luxury'>('resources');
  const [floatingCashNotice, setFloatingCashNotice] = useState<string | null>(null);

  const progress = getPlayerProgress(profile);

  // Dynamic Village Buildings derived from profile
  const hqLevel = Math.max(1, Math.floor(progress.level / 2) + 1);
  const mainCompany = profile.companies[0];
  const companyLevel = mainCompany?.upgradeLevel ?? 1;
  const factoryProfit = (mainCompany ? companyLevel * 65000 : 0);

  const buildings: VillageBuilding[] = [
    {
      id: 'hq-tower',
      name: 'برج المقر الرئيسي (Empire Town Hall)',
      category: 'hq',
      level: hqLevel,
      icon: '🏢',
      role: 'مركز القيادة والهيمنة',
      description: 'المقر المركزي لإدارة كافة الاستثمارات والشركات. رفع مستواه يفتح قطاعات صناعية جديدة ويزيد الطاقة الاستيعابية للخزائن.',
      stats: {
        label1: 'العائد السلبي اليومي',
        val1: `+${(hqLevel * 25000).toLocaleString()} ج.م`,
        label2: 'الحد الأقصى للشركات',
        val2: `${hqLevel * 2} شركات`,
      },
      upgradeCost: hqLevel * 300000,
      upgradeDiamonds: 10,
      targetSection: 'home',
    },
    {
      id: 'main-factory',
      name: mainCompany?.name ?? 'مصنع العاشر للأغذية (قصة الكفاح)',
      category: 'factory',
      level: companyLevel,
      icon: '🏭',
      role: 'الصناعات الغذائية والتعبئة',
      description: 'المصنع المنهار الذي تم إنقاذه. يواصل إنتاج السلع الأساسية وتوريدها للأسواق بعوائد يومية مستمرة.',
      stats: {
        label1: 'الإنتاج اليومي المقدر',
        val1: `+${factoryProfit.toLocaleString()} ج.م`,
        label2: 'كفاءة الماكينات',
        val2: `${Math.min(100, 25 + companyLevel * 25)}%`,
      },
      upgradeCost: companyLevel * 180000,
      upgradeDiamonds: 15,
      targetSection: 'production',
      readyProfit: factoryProfit,
    },
    {
      id: 'central-vault',
      name: 'الخزينة النقدية الكبرى (Cash Vault)',
      category: 'vault',
      level: Math.max(1, Math.floor(profile.bankBalance / 500000) + 1),
      icon: '🏦',
      role: 'تأمين وحفظ السيولة',
      description: 'خزائن مصفحة لحفظ أموال الإمبراطورية وتسيير المعاملات البنكية والقروض الاستثمارية.',
      stats: {
        label1: 'السيولة المودعة',
        val1: formatMoney(profile.bankBalance, country),
        label2: 'سعة التخزين القصوى',
        val2: `${((Math.max(1, Math.floor(profile.bankBalance / 500000) + 1)) * 3000000).toLocaleString()} ج.م`,
      },
      upgradeCost: 200000,
      upgradeDiamonds: 5,
      targetSection: 'bank',
    },
    {
      id: 'logistics-warehouse',
      name: 'مستودع الخامات واللوجستيات',
      category: 'warehouse',
      level: 2,
      icon: '📦',
      role: 'التخزين والتوزيع',
      description: 'مستودعات مركزية مبردة وجافة لحفظ مخزون الخامات (ألومنيوم، خامات غذائية، محاصيل) والمنتجات تامة الصنع.',
      stats: {
        label1: 'المخزون المشغول',
        val1: '64%',
        label2: 'سرعة الشحن',
        val2: 'سريعة (+20%)',
      },
      upgradeCost: 150000,
      upgradeDiamonds: 8,
      targetSection: 'inventory',
    },
    {
      id: 'builders-guild',
      name: 'كوخ المهندسين والخبراء (Builders Hut)',
      category: 'builders',
      level: 1,
      icon: '👷',
      role: 'الصيانة والتطوير',
      description: 'فريق المهندسين برئاسة عم إبراهيم. يشرفون على تطوير الماكينات، وصيانة الخطوط، وتوسعة المباني.',
      stats: {
        label1: 'المهندسون المتاحون',
        val1: '2 من 2 جاهزون',
        label2: 'سرعة البناء',
        val2: 'قياسية',
      },
      upgradeCost: 400000,
      upgradeDiamonds: 50,
      targetSection: 'staff',
    },
    {
      id: 'defense-tower',
      name: 'برج الحماية القانونية والأمنية',
      category: 'defense',
      level: 1,
      icon: '🛡️',
      role: 'درع الإمبراطورية',
      description: 'يحمي أعمالك من محاولات التخريب، الحملات الإعلامية المغرضة، ومؤامرات المنافس طارق الألفي.',
      stats: {
        label1: 'درع الحماية النشط',
        val1: '14 ساعة متبقية',
        label2: 'نسبة صد النزاعات',
        val2: '85%',
      },
      upgradeCost: 250000,
      upgradeDiamonds: 12,
      targetSection: 'staff',
    },
    {
      id: 'rnd-lab',
      name: 'مختبر الابتكار وتكنولوجيا المستقبل',
      category: 'rnd',
      level: 1,
      icon: '🔬',
      role: 'البحث والتطوير R&D',
      description: 'ابتكار براءات اختراع وميكنة ذكية للإنتاج ترفع هامش الربح وتخفض استهلاك الطاقة الكهربائية.',
      stats: {
        label1: 'براءات الاختراع',
        val1: '1 قيد البحث',
        label2: 'وفر التكاليف',
        val2: '+15%',
      },
      upgradeCost: 350000,
      upgradeDiamonds: 20,
      targetSection: 'home',
    },
    {
      id: 'expansion-plot',
      name: 'أرض صناعية جديدة (برسم المزاد)',
      category: 'expansion',
      level: 0,
      icon: '🗺️',
      role: 'توسعة القرية',
      description: 'قطعة أرض شاغرة في المنطقة الصناعية جاهزة للاستملاك عبر صالة المزادات لإقامة خطوط إنتاج جديدة.',
      stats: {
        label1: 'سعر فتح المزاد',
        val1: '500,000 ج.م',
        label2: 'الموقع',
        val2: 'العاشر من رمضان',
      },
      upgradeCost: 500000,
      targetSection: 'auctions',
    },
  ];

  // Action: Collect Profit
  const handleCollect = (amount: number) => {
    playSound('cash');
    setFloatingCashNotice(`+${amount.toLocaleString()} ج.م`);
    setTimeout(() => setFloatingCashNotice(null), 1500);

    onUpdateProfile((prev) => ({
      ...prev,
      bankBalance: prev.bankBalance + amount,
    }));
  };

  // Action: Upgrade Building
  const handleUpgrade = (building: VillageBuilding) => {
    if (profile.bankBalance < building.upgradeCost) {
      playSound('error');
      alert(`رصيد السيولة غير كافٍ! تحتاج إلى ${building.upgradeCost.toLocaleString()} ج.م للترقية.`);
      return;
    }

    playSound('success');
    playSound('levelUp');

    onUpdateProfile((prev) => {
      const updatedCompanies = prev.companies.map((c, i) => {
        if (building.category === 'factory' && i === 0) {
          return { ...c, upgradeLevel: (c.upgradeLevel ?? 1) + 1 };
        }
        return c;
      });

      return {
        ...prev,
        bankBalance: prev.bankBalance - building.upgradeCost,
        companies: updatedCompanies,
      };
    });

    setSelectedBuilding(null);
  };

  // Action: Boost with diamonds
  const handleBoost = (building: VillageBuilding) => {
    const cost = building.upgradeDiamonds ?? 15;
    if (profile.diamonds < cost) {
      playSound('error');
      alert(`تحتاج إلى ${cost} ماسة لتسريع هذا المبنى!`);
      return;
    }

    playSound('unlock');
    onUpdateProfile((prev) => ({
      ...prev,
      diamonds: prev.diamonds - cost,
      bankBalance: prev.bankBalance + 100000,
    }));

    setSelectedBuilding(null);
  };

  return (
    <div className="clash-village-viewport">
      <div className="clash-village-grid-bg" />

      <div className="clash-village-canvas">
        {/* Top Village Banner & View Switcher */}
        <div className="clash-village-top-banner">
          <div className="clash-village-banner-info">
            <span className="clash-village-flag">{country.flag}</span>
            <div>
              <div className="clash-village-title">
                مدينة إمبراطورية الأعمال: {profile.name || 'المقر الرئيسي'}
              </div>
              <div className="clash-village-subtitle">
                مجمع العاشر من رمضان الصناعي · المستوى {progress.level} · إشراف عم إبراهيم
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="clash-village-stats hidden sm:flex">
              <div className="clash-stat-chip">
                <span>👷 المهندسون:</span>
                <strong className="text-emerald-400">2/2</strong>
              </div>
              <div className="clash-stat-chip">
                <span>🛡️ حماية:</span>
                <strong className="text-amber-400">14س</strong>
              </div>
            </div>

            {/* Switch View Button */}
            <button
              onClick={onSwitchToClassic}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="التبديل إلى لوحة التحكم الرقمية"
            >
              <span>لوحة التحكم 📊</span>
            </button>
          </div>
        </div>

        {/* The Buildings Grid (Clash Town) */}
        <div className="clash-buildings-grid">
          {buildings.map((b) => {
            const isHq = b.category === 'hq';
            const isFactory = b.category === 'factory';
            const isExpansion = b.category === 'expansion';

            return (
              <div
                key={b.id}
                className={`clash-building-tile ${isHq ? 'is-hq' : ''} ${isExpansion ? 'is-expansion' : ''}`}
                onClick={() => {
                  playSound('click');
                  setSelectedBuilding(b);
                }}
              >
                {/* Level Tag */}
                {!isExpansion && (
                  <div className="clash-building-level">
                    ★ مستوى {b.level}
                  </div>
                )}

                {/* Floating Collect Cash Bubble for Factory */}
                {isFactory && b.readyProfit && b.readyProfit > 0 && (
                  <button
                    className="clash-collect-bubble"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCollect(b.readyProfit!);
                    }}
                    title="انقر لجمع الأرباح فوراً!"
                  >
                    <span>💵</span>
                    <span>+{b.readyProfit.toLocaleString()}</span>
                  </button>
                )}

                {/* Floating Flying Cash Animation */}
                {isFactory && floatingCashNotice && (
                  <div className="clash-flying-cash">{floatingCashNotice}</div>
                )}

                {/* Building Visual Center */}
                <div className="clash-building-center">
                  <div className="clash-building-avatar">{b.icon}</div>
                  <div className="clash-building-name">{b.name}</div>
                  <div className="clash-building-role">{b.role}</div>
                </div>

                {/* Progress bar for factory/HQ */}
                {(isFactory || isHq) && (
                  <div className="clash-building-progress-wrap">
                    <div className="clash-building-progress-bar">
                      <div className="clash-building-progress-fill" style={{ width: '85%' }} />
                    </div>
                  </div>
                )}

                {/* Building Footer Stats */}
                <div className="clash-building-footer">
                  <span className="clash-building-stat-value">{b.stats.val1}</span>
                  <span className="clash-building-action-hint">
                    {isExpansion ? 'دخول المزاد 🔨' : 'ترقية وإدارة ⬆️'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* =========================================================
            Command Operations Bar (Integrated in-flow, NOT floating over nav)
            ========================================================= */}
        <div className="clash-village-actions-bar">
          <button
            className="clash-action-pill-btn is-attack"
            onClick={() => {
              playSound('auction');
              setIsBattleModalOpen(true);
            }}
          >
            <span className="text-2xl">⚔️</span>
            <div className="text-right">
              <strong className="block text-xs font-black text-white">معارك السوق والاستحواذ</strong>
              <small className="block text-[10px] text-rose-200">تحدي طارق الألفي والمناقصات</small>
            </div>
          </button>

          <button
            className="clash-action-pill-btn is-shop"
            onClick={() => {
              playSound('click');
              setIsShopModalOpen(true);
            }}
          >
            <span className="text-2xl">🔨</span>
            <div className="text-right">
              <strong className="block text-xs font-black text-white">متجر الإنشاءات والتجهيز</strong>
              <small className="block text-[10px] text-amber-200">بناء مصانع وخزائن جديدة</small>
            </div>
          </button>

          <button
            className="clash-action-pill-btn is-cartel"
            onClick={() => {
              playSound('click');
              onNavigate('cartel');
            }}
          >
            <Users className="w-6 h-6 text-sky-300" />
            <div className="text-right">
              <strong className="block text-xs font-black text-white">تحالفات الأعمال والكارتيل</strong>
              <small className="block text-[10px] text-sky-200">التكتلات وحروب الأسعار</small>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================
          Clash Building Inspector Modal
          ========================================================= */}
      {selectedBuilding && (
        <div className="clash-inspector-backdrop" onClick={() => setSelectedBuilding(null)}>
          <div className="clash-inspector-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="clash-inspector-header">
              <div className="clash-inspector-title-group">
                <div className="clash-inspector-avatar">{selectedBuilding.icon}</div>
                <div>
                  <h3 className="clash-inspector-name">{selectedBuilding.name}</h3>
                  <div className="clash-inspector-tag">
                    ★ المستوى {selectedBuilding.level} · {selectedBuilding.role}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="clash-inspector-body">
              <p className="clash-inspector-desc">{selectedBuilding.description}</p>

              <div className="clash-inspector-stats">
                <div className="clash-inspector-stat-box">
                  <div className="clash-inspector-stat-label">{selectedBuilding.stats.label1}</div>
                  <div className="clash-inspector-stat-val text-emerald-400">
                    {selectedBuilding.stats.val1}
                  </div>
                </div>
                <div className="clash-inspector-stat-box">
                  <div className="clash-inspector-stat-label">{selectedBuilding.stats.label2}</div>
                  <div className="clash-inspector-stat-val text-amber-400">
                    {selectedBuilding.stats.val2}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="clash-inspector-actions">
              {/* Upgrade Button */}
              <button
                className="clash-action-card-btn is-upgrade"
                onClick={() => handleUpgrade(selectedBuilding)}
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span className="text-xs">ترقية المبنى</span>
                <small className="text-[10px] font-mono opacity-90">
                  {selectedBuilding.upgradeCost.toLocaleString()} ج.م
                </small>
              </button>

              {/* Boost Button */}
              <button
                className="clash-action-card-btn is-boost"
                onClick={() => handleBoost(selectedBuilding)}
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs">تسريع فوري</span>
                <small className="text-[10px] font-mono opacity-90">
                  {selectedBuilding.upgradeDiamonds ?? 15} 💎
                </small>
              </button>

              {/* Manage Deep Section */}
              <button
                className="clash-action-card-btn is-manage"
                onClick={() => {
                  setSelectedBuilding(null);
                  onNavigate(selectedBuilding.targetSection);
                }}
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-xs">إدارة وتفاصيل</span>
                <small className="text-[10px] opacity-80">فتح القسم</small>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Clash Battle / Attack Conquest Modal
          ========================================================= */}
      {isBattleModalOpen && (
        <div className="clash-inspector-backdrop" onClick={() => setIsBattleModalOpen(false)}>
          <div className="clash-inspector-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="clash-inspector-header">
              <div className="clash-inspector-title-group">
                <div className="clash-inspector-avatar text-rose-500">⚔️</div>
                <div>
                  <h3 className="clash-inspector-name">معارك السوق وغزو الإمبراطوريات</h3>
                  <div className="clash-inspector-tag text-rose-400">
                    منافسات تجارية، استيلاء على حصص السوق، ومزادات كبرى
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsBattleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Rival Challenge */}
              <div
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-rose-500 cursor-pointer flex items-center justify-between transition-all"
                onClick={() => {
                  setIsBattleModalOpen(false);
                  onNavigate('investments');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦹‍♂️</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">تحدي المنافس طارق الألفي</h4>
                    <p className="text-[11px] text-slate-400">حرب أسعار ومناقصات لإضعاف نفوذه وسحب حصته السوقية.</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">
                  بدء الهجوم ⚔️
                </button>
              </div>

              {/* Land Conquest Auction */}
              <div
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-500 cursor-pointer flex items-center justify-between transition-all"
                onClick={() => {
                  setIsBattleModalOpen(false);
                  onNavigate('auctions');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏛️</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">مزادات الأراضي والمواقع الإستراتيجية</h4>
                    <p className="text-[11px] text-slate-400">المزايدة ضد حيتان السوق للاستحواذ على الأراضي النادرة.</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">
                  دخول المزاد 🔨
                </button>
              </div>

              {/* National Megaprojects */}
              <div
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer flex items-center justify-between transition-all"
                onClick={() => {
                  setIsBattleModalOpen(false);
                  onNavigate('megaprojects');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏗️</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">مناقصات المشروعات القومية الكبرى</h4>
                    <p className="text-[11px] text-slate-400">المنافسة على عقود البنية التحتية والموانئ ومحطات الطاقة.</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
                  المنافسة 🏆
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Clash Shop / Build Hammer Modal
          ========================================================= */}
      {isShopModalOpen && (
        <div className="clash-inspector-backdrop" onClick={() => setIsShopModalOpen(false)}>
          <div className="clash-inspector-modal max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="clash-inspector-header">
              <div className="clash-inspector-title-group">
                <div className="clash-inspector-avatar text-amber-500">🔨</div>
                <div>
                  <h3 className="clash-inspector-name">متجر الإنشاءات والتطوير (Shop)</h3>
                  <div className="clash-inspector-tag text-amber-400">
                    بناء المصانع، توسيع الخزائن، وتطوير معالم الإمبراطورية
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsShopModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shop Tabs */}
            <div className="clash-shop-tabs">
              <button
                className={`clash-shop-tab-btn ${shopTab === 'resources' ? 'is-active' : ''}`}
                onClick={() => setShopTab('resources')}
              >
                🏦 الموارد والخزائن
              </button>
              <button
                className={`clash-shop-tab-btn ${shopTab === 'production' ? 'is-active' : ''}`}
                onClick={() => setShopTab('production')}
              >
                🏭 خطوط الإنتاج والمصانع
              </button>
              <button
                className={`clash-shop-tab-btn ${shopTab === 'defense' ? 'is-active' : ''}`}
                onClick={() => setShopTab('defense')}
              >
                🛡️ الدفاع والأمن
              </button>
              <button
                className={`clash-shop-tab-btn ${shopTab === 'luxury' ? 'is-active' : ''}`}
                onClick={() => setShopTab('luxury')}
              >
                👑 الهيبة والمشاريع الفاخرة
              </button>
            </div>

            {/* Shop Items */}
            <div className="clash-shop-items-grid">
              {shopTab === 'resources' && (
                <>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">🏦</div>
                    <div className="clash-shop-item-title">خزينة السيولة الفاخرة</div>
                    <div className="clash-shop-item-price">350,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('bank');
                      }}
                    >
                      بناء وتجهيز 🔨
                    </button>
                  </div>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">📦</div>
                    <div className="clash-shop-item-title">مستودع لوجستي عملاق</div>
                    <div className="clash-shop-item-price">250,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('inventory');
                      }}
                    >
                      بناء وتجهيز 🔨
                    </button>
                  </div>
                </>
              )}

              {shopTab === 'production' && (
                <>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">💊</div>
                    <div className="clash-shop-item-title">مصنع أدوية ومستحضرات</div>
                    <div className="clash-shop-item-price">750,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('production');
                      }}
                    >
                      تأسيس المصنع 🏭
                    </button>
                  </div>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">⚡</div>
                    <div className="clash-shop-item-title">مجمع الطاقة الشمسية</div>
                    <div className="clash-shop-item-price">1,200,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('production');
                      }}
                    >
                      تأسيس المجمع ⚡
                    </button>
                  </div>
                </>
              )}

              {shopTab === 'defense' && (
                <>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">⚖️</div>
                    <div className="clash-shop-item-title">مكتب الشؤون القانونية والمستشارين</div>
                    <div className="clash-shop-item-price">180,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('staff');
                      }}
                    >
                      توظيف وتجهيز 🛡️
                    </button>
                  </div>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">🚨</div>
                    <div className="clash-shop-item-title">مركز الاستخبارات الاقتصادية</div>
                    <div className="clash-shop-item-price">300,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('staff');
                      }}
                    >
                      توظيف وتجهيز 🛡️
                    </button>
                  </div>
                </>
              )}

              {shopTab === 'luxury' && (
                <>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">🛥️</div>
                    <div className="clash-shop-item-title">يخت رئاسي فاخر في مارينا</div>
                    <div className="clash-shop-item-price">2,500,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('luxury');
                      }}
                    >
                      شراء واقتناء 👑
                    </button>
                  </div>
                  <div className="clash-shop-item-card">
                    <div className="clash-shop-item-icon">🚁</div>
                    <div className="clash-shop-item-title">مهبط هليكوبتر فوق المقر</div>
                    <div className="clash-shop-item-price">1,800,000 ج.م</div>
                    <button
                      className="clash-shop-item-buy-btn"
                      onClick={() => {
                        setIsShopModalOpen(false);
                        onNavigate('luxury');
                      }}
                    >
                      إنشاء المهبط 🚁
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
