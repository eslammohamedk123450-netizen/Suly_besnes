import { useState } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { Icon } from './Icon';
import { ItemImage } from './ItemImage';
import { selectOperationsSnapshot } from '../game/selectors';
import { type GameCommand, type GameResult } from '../game/engine';
import { MarketNewsTicker } from './MarketNewsTicker';
import { StoryCampaignHub } from './StoryCampaignHub';
import { SmartOnboardingQuests } from './SmartOnboardingQuests';
import { RivalCharactersHub } from './RivalCharactersHub';
import { StruggleStoryHub } from './StruggleStoryHub';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onClaimReward?: (cash: number, diamonds: number, questId: string) => void;
  onRequestEmergencyLoan?: () => void;
  onUpdateProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onOpenLuckyWheel?: () => void;
}

export function Dashboard({ 
  profile, 
  country, 
  onNavigate, 
  onCommand,
  onClaimReward,
  onRequestEmergencyLoan,
  onUpdateProfile,
  onOpenLuckyWheel,
}: DashboardProps) {
  const [campaignOpen, setCampaignOpen] = useState(false);
  const operations = selectOperationsSnapshot(profile, country.economy.operatingCostMultiplier ?? 1);
  const companyCount = profile.companies.length;

  // Real operations from player's finance ledger
  const recentOperations = (profile.financeLedger && profile.financeLedger.length > 0)
    ? [...profile.financeLedger].reverse().slice(0, 4).map((entry) => ({
        id: entry.id,
        title: entry.title,
        subtitle: `اليوم الإمبراطوري ${entry.day}`,
        amount: `${entry.type === 'expense' || entry.type === 'liability' ? '-' : '+'} ${entry.amount.toLocaleString()} ${country.currency.code}`,
        type: (entry.type === 'expense' || entry.type === 'liability' ? 'expense' : 'revenue') as 'expense' | 'revenue',
        icon: (entry.type === 'expense' ? 'factory' : 'briefcase') as any,
      }))
    : [
        { id: '1', title: 'خطة إنقاذ المصنع المنهار', subtitle: `اليوم ${profile.day}`, amount: `+ ${(profile.bankBalance || 0).toLocaleString()} ${country.currency.code}`, type: 'revenue' as const, icon: 'briefcase' as const },
      ];

  // Leaderboard data as shown in design image
  const leaderboardTop3 = [
    { rank: 1, name: 'صالح ثونة', score: '2,940,915', avatar: '👳‍♂️', badge: '🥇' },
    { rank: 2, name: 'داوود الهزاع', score: '2,470,600', avatar: '👨‍💼', badge: '🥈' },
    { rank: 3, name: 'تقى الشمري', score: '1,965,410', avatar: '👩‍💼', badge: '🥉' },
  ];

  const leaderboardRanks = [
    { rank: 4, name: 'سالمو الروية', score: '2,846,915' },
    { rank: 5, name: 'فارس الماجد', score: '2,415,660' },
    { rank: 6, name: 'ليلى القاسمي', score: '1,083,430' },
    { rank: 7, name: 'ياسر المستثمر', score: '1,630,220' },
    { rank: 8, name: 'مريم التنمية', score: '1,541,775' },
    { rank: 9, name: 'جابر الابتكار', score: '1,246,320' },
    { rank: 10, name: 'سارة المستقبل', score: '997,542' },
  ];

  return (
    <div className="empire-dashboard-grid">
      {/* Live Breaking Market News Banner */}
      <MarketNewsTicker day={profile.day} onOpenCampaign={() => setCampaignOpen(true)} />

      {/* Daily Lucky Spin Interactive Banner */}
      {onOpenLuckyWheel && (
        <div 
          onClick={onOpenLuckyWheel}
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-yellow-950/40 border border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400/70 transition shadow-lg shadow-amber-950/30 my-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/30 shrink-0">
              🎡
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                عجلة الحظ والاستثمار اليومية
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  متاحة مجاناً!
                </span>
              </h4>
              <p className="text-xs text-amber-200/80">
                دوّر العجلة واربح سيولة طارئة، سبائك ذهب، أو ماسات لدعم إمبراطوريتك
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shrink-0 shadow-md transition"
          >
            تدوير 🎯
          </button>
        </div>
      )}

      {/* سيناريو قصة كفاح: إنقاذ المصنع المنهار (The Struggle & Turnaround Hub) */}
      <StruggleStoryHub
        profile={profile}
        onNavigate={onNavigate}
        onUpdateProfile={onUpdateProfile ?? ((updater) => {
          onCommand(
            { name: 'redeem_reward_code', args: { code: 'STORY-UPDATE' } } as any,
            (curr) => ({ ok: true, profile: updater(curr), message: 'تم تحديث قصة الكفاح', data: null })
          );
        })}
      />

      {/* Smart Guided Onboarding Quests & Emergency Loan (التعديل الجديد: دليل المبتدئ والتسهيل الائتماني) */}
      <SmartOnboardingQuests
        profile={profile}
        onNavigate={onNavigate}
        onClaimReward={onClaimReward ?? ((cash, diamonds) => {
          onCommand(
            { name: 'redeem_reward_code', args: { code: 'QUEST-CLAIM' } } as any,
            (curr) => ({ 
              ok: true, 
              profile: { ...curr, bankBalance: (curr.bankBalance ?? 0) + cash, diamonds: (curr.diamonds ?? 0) + diamonds },
              message: 'تم استلام مكافأة المهمة',
              data: null
            })
          );
        })}
        onRequestEmergencyLoan={onRequestEmergencyLoan ?? (() => {
          onCommand(
            { name: 'redeem_reward_code', args: { code: 'EMERGENCY-LOAN' } } as any,
            (curr) => ({ 
              ok: true, 
              profile: { ...curr, bankBalance: (curr.bankBalance ?? 0) + 250000 },
              message: 'تم إيداع التسهيل الائتماني',
              data: null
            })
          );
        })}
      />

      {/* Rival Characters Hub (التعديل الجديد: شخصيات المنافسين التفاعلية) */}
      <RivalCharactersHub profile={profile} />

      {/* ================= TOP ROW: STORY CARD + COMPANIES OVERVIEW ================= */}
      <div className="empire-top-row">
        {/* LEFT COLUMN: STORY & QUEST */}
        <div className="empire-left-col">
          {/* Story Card */}
          <section className="empire-card empire-story-card">
            <div className="empire-story-bg" />
            <div className="empire-story-content">
              <span className="empire-badge-kicker">الفصل الأول</span>
              <h2>إرث عائلة النيل</h2>
              <p>رحلة تبدأ من قلب القاهرة، حيث تتحول الطموحات إلى إمبراطورية.</p>
              <div className="empire-story-footer">
                <span className="empire-story-tag">ماضٍ عريق.. مستقبل أبهر</span>
                <button className="empire-btn-gold" type="button" onClick={() => setCampaignOpen(true)}>
                  تابع القصة <Icon name="chevron" size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* Current Quest Card */}
          <section className="empire-card empire-quest-card">
            <div className="empire-quest-icon">
              <Icon name="tasks" size={28} />
            </div>
            <div className="empire-quest-info">
              <span className="empire-quest-label">مهمتك الحالية</span>
              <h3>{operations.nextStep.title || 'تأسيس شركتك الأولى'}</h3>
              <div className="empire-quest-bar">
                <div className="empire-quest-track">
                  <span style={{ width: `${companyCount > 0 ? 100 : 0}%` }} />
                </div>
                <small>{companyCount > 0 ? '1/1' : '0/1'}</small>
              </div>
            </div>
            <button className="empire-btn-teal" type="button" onClick={() => onNavigate(operations.nextStep.section)}>
              أذهب المهمة <Icon name="chevron" size={14} />
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: COMPANIES SECTION */}
        <div className="empire-right-col">
          <section className="empire-card empire-companies-card">
            <div className="empire-card-header empire-companies-header">
              <div>
                <h2>الشركات</h2>
                <small>شركاتك تقود الإمبراطورية</small>
              </div>
              <span className="empire-pill-count">{companyCount} / 10 شركات</span>
            </div>

            {/* Real Player Companies List */}
            {profile.companies.length > 0 ? (
              <>
                {/* Featured Active Company Card */}
                {(() => {
                  const featured = profile.companies[0];
                  const condition = featured.maintenanceCondition ?? 100;
                  const level = featured.upgradeLevel ?? 1;
                  const cost = featured.operatingCostPerDay ?? 15000;
                  return (
                    <div className="empire-company-featured">
                      <div className="empire-company-head">
                        <div className="empire-company-logo">
                          {featured.industryId.includes('food') ? '🌾' : featured.industryId.includes('energy') ? '⚡' : featured.industryId.includes('petro') ? '🛢️' : '🏭'}
                        </div>
                        <div className="empire-company-title">
                          <h3>{featured.name}</h3>
                          <small>قطاع {featured.industryId} · كفاءة {condition}%</small>
                        </div>
                        <span className="empire-level-badge">المستوى {level}</span>
                      </div>
                      <div className="empire-company-stats">
                        <div>
                          <small>تكلفة التشغيل</small>
                          <strong>{cost.toLocaleString()} {country.currency.code}</strong>
                        </div>
                        <div>
                          <small>كفاءة الماكينات</small>
                          <strong className={condition < 50 ? 'text-rose-400' : 'text-emerald-400'}>{condition}%</strong>
                        </div>
                        <div>
                          <small>مستوى التطوير</small>
                          <strong>{level} / 5</strong>
                        </div>
                      </div>
                      <div className="empire-company-progress">
                        <div className="empire-progress-track">
                          <span style={{ width: `${Math.min(100, (level / 5) * 100)}%` }} />
                        </div>
                        <small>{Math.round((level / 5) * 100)}%</small>
                      </div>
                      <div className="empire-company-actions">
                        <button className="empire-btn-outline" type="button" onClick={() => onNavigate('production')}>
                          تشغيل الإنتاج ⚡
                        </button>
                        <button className="empire-btn-dark" type="button" onClick={() => onNavigate('companies')}>
                          إدارة وصيانة ⚙️
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Sub-Companies Grid if more than 1 company */}
                {profile.companies.length > 1 && (
                  <div className="empire-companies-grid">
                    {profile.companies.slice(1, 3).map((subCo) => (
                      <div className="empire-company-sub" key={subCo.id}>
                        <div className="empire-sub-head">
                          <div className="empire-sub-icon">
                            {subCo.industryId.includes('food') ? '🌾' : subCo.industryId.includes('energy') ? '⚡' : subCo.industryId.includes('transport') ? '🚢' : '🏭'}
                          </div>
                          <div>
                            <h4>{subCo.name}</h4>
                            <small>المستوى {subCo.upgradeLevel ?? 1} · كفاءة {subCo.maintenanceCondition ?? 100}%</small>
                          </div>
                        </div>
                        <div className="empire-sub-metrics">
                          <div><span>التشغيل</span><strong>{(subCo.operatingCostPerDay ?? 10000).toLocaleString()}</strong></div>
                          <div><span>الكفاءة</span><strong>{subCo.maintenanceCondition ?? 100}%</strong></div>
                          <div><span>المستوى</span><strong>{subCo.upgradeLevel ?? 1}</strong></div>
                        </div>
                        <div className="empire-sub-actions">
                          <button className="empire-btn-sm-teal" type="button" onClick={() => onNavigate('production')}>إنتاج ⚡</button>
                          <button className="empire-btn-sm-dark" type="button" onClick={() => onNavigate('companies')}>إدارة ⚙️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-5 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 my-3">
                <span className="text-3xl block mb-2">🏭</span>
                <h4 className="font-bold text-white text-sm mb-1">لا توجد شركات مؤسسة بعد</h4>
                <p className="text-xs text-slate-400 mb-4">
                  ابدأ بتأسيس أول مصنع أو شركة صناعية لبدء دوران عجلة الإنتاج والأرباح.
                </p>
                <button className="empire-btn-teal px-4 py-2 text-xs font-bold" type="button" onClick={() => onNavigate('companies')}>
                  تأسيس شركتك الأولى الآن 🚀
                </button>
              </div>
            )}

            {/* Add Company CTA */}
            <button className="empire-btn-add-company" type="button" onClick={() => onNavigate('companies')}>
              <span>+</span> تأسيس شركة جديدة
            </button>
          </section>
        </div>
      </div>

      {/* ================= MIDDLE ROW: LANDS SECTION ================= */}
      <section className="empire-card empire-lands-section">
        <div className="empire-card-header">
          <div>
            <h2>الأراضي</h2>
            <small>اختر موقع توسعك الاستثماري.</small>
          </div>
          <button className="empire-link-btn" type="button" onClick={() => onNavigate('lands')}>
            عرض الخريطة الكاملة <Icon name="chevron" size={14} />
          </button>
        </div>

        <div className="empire-lands-layout">
          {/* Featured Owned Land or Acquisition CTA */}
          {profile.lands.length > 0 ? (
            (() => {
              const ownedLand = profile.lands[0];
              return (
                <div className="empire-land-featured">
                  <div className="empire-land-image-wrap">
                    <span className="empire-land-owned-badge">أرضك الإمبراطورية</span>
                    <div className="empire-land-overlay-info">
                      <h3>{ownedLand.label}</h3>
                      <p>{ownedLand.areaSquareMeters.toLocaleString()} م² · قطاع {ownedLand.landType ?? 'صناعي'} <Icon name="target" size={14} /></p>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="empire-land-featured p-6 text-center flex flex-col items-center justify-center bg-slate-900/70 rounded-2xl border border-dashed border-slate-700">
              <span className="text-3xl mb-2">🗺️</span>
              <h4 className="font-bold text-white text-sm mb-1">لا تملك أراضٍ مسجلة بعد</h4>
              <p className="text-xs text-slate-400 mb-3">
                المصانع والشركات تحتاج إلى مساحات مرخصة للبناء والتوسع.
              </p>
              <button className="empire-btn-buy" type="button" onClick={() => onNavigate('lands')}>
                المزايدة على الأراضي 🛒
              </button>
            </div>
          )}

          {/* Available Lands List */}
          <div className="empire-lands-available">
            <span className="empire-sub-label">الأراضي المتاحة للشراء</span>
            <div className="empire-lands-grid">
              <div className="empire-land-card">
                <ItemImage type="land" landType="agricultural" name="أرض زراعية" size="sm" />
                <div className="empire-land-details">
                  <h4>أرض زراعية خصبة</h4>
                  <small>600 م² · ضفاف النيل</small>
                  <button className="empire-btn-buy" type="button" onClick={() => onNavigate('lands')}>
                    اشتر الأرض 🛒
                  </button>
                </div>
              </div>

              <div className="empire-land-card">
                <ItemImage type="land" landType="commercial" name="أرض تجارية" size="sm" />
                <div className="empire-land-details">
                  <h4>أرض تجارية متميزة</h4>
                  <small>450 م² · وسط العاصمة</small>
                  <button className="empire-btn-buy" type="button" onClick={() => onNavigate('lands')}>
                    اشتر الأرض 🛒
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM ROW: MANAGEMENT, ANALYTICS & LEADERBOARD ================= */}
      <div className="empire-bottom-row">
        {/* PANEL 1: STAFF & MANAGEMENT */}
        <section className="empire-card empire-staff-panel">
          <div className="empire-card-header">
            <div>
              <h2>الإدارة والرواتب</h2>
              <small>أدر القوة التشغيلية لأثر أكبر</small>
            </div>
          </div>

          {/* Staff Manager Card */}
          <div className="empire-staff-card">
            <div className="empire-staff-avatar">👷‍♂️</div>
            <div className="empire-staff-info">
              <h4>مدير المصنع</h4>
              <small>مصنع المواد الغذائية</small>
              <span className="empire-salary-tag">1,000 {country.currency.code} / يوم</span>
            </div>
            <button className="empire-btn-sm-gold" type="button" onClick={() => onNavigate('staff')}>
              ترقية
            </button>
          </div>

          {/* Recent Operations Log */}
          <div className="empire-operations-log">
            <h4>أحدث العمليات</h4>
            {recentOperations.map((op) => (
              <div className="empire-log-item" key={op.id}>
                <div className={`empire-log-icon empire-log-icon--${op.type}`}>
                  <Icon name={op.icon} size={16} />
                </div>
                <div className="empire-log-info">
                  <strong>{op.title}</strong>
                  <small>{op.subtitle}</small>
                </div>
                <span className={`empire-log-amount empire-log-amount--${op.type}`}>{op.amount}</span>
              </div>
            ))}
          </div>

          <button className="empire-btn-teal-wide" type="button" onClick={() => onNavigate('staff')}>
            وظف موظفاً جديداً
          </button>
        </section>

        {/* PANEL 2: FINANCIAL CHARTS & PREVIEW */}
        <section className="empire-card empire-charts-panel">
          <div className="empire-card-header">
            <div>
              <h2>الأداء المالي</h2>
              <small>تقرير الأرباح والمصروفات</small>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="empire-finance-summary">
            <div className="empire-finance-box empire-finance-box--green">
              <small>صافي الربح</small>
              <strong>250K</strong>
            </div>
            <div className="empire-finance-box empire-finance-box--red">
              <small>المصروفات</small>
              <strong>230K</strong>
            </div>
            <div className="empire-finance-box empire-finance-box--blue">
              <small>الإيرادات</small>
              <strong>480K</strong>
            </div>
          </div>

          {/* Mock Financial Bar Charts */}
          <div className="empire-chart-box">
            <span className="empire-chart-title">الأداء الأسبوعي</span>
            <div className="empire-bars">
              <div className="empire-bar-group"><span className="bar green" style={{ height: '60%' }} /><span className="bar red" style={{ height: '30%' }} /></div>
              <div className="empire-bar-group"><span className="bar green" style={{ height: '80%' }} /><span className="bar red" style={{ height: '40%' }} /></div>
              <div className="empire-bar-group"><span className="bar green" style={{ height: '45%' }} /><span className="bar red" style={{ height: '50%' }} /></div>
              <div className="empire-bar-group"><span className="bar green" style={{ height: '90%' }} /><span className="bar red" style={{ height: '35%' }} /></div>
              <div className="empire-bar-group"><span className="bar green" style={{ height: '70%' }} /><span className="bar red" style={{ height: '25%' }} /></div>
            </div>
          </div>

          <div className="empire-chart-box">
            <span className="empire-chart-title">الأداء اليومي</span>
            <div className="empire-bars empire-bars--daily">
              <div className="bar-single green" style={{ height: '40%' }} />
              <div className="bar-single green" style={{ height: '65%' }} />
              <div className="bar-single green" style={{ height: '85%' }} />
              <div className="bar-single green" style={{ height: '50%' }} />
              <div className="bar-single green" style={{ height: '75%' }} />
            </div>
          </div>
        </section>

        {/* PANEL 3: GLOBAL LEADERBOARD */}
        <section className="empire-card empire-leaderboard-panel">
          <div className="empire-card-header">
            <div>
              <h2>المتصدرون</h2>
              <small>أقوى قادة الأعمال في العالم العربي</small>
            </div>
            <button className="empire-btn-sm-outline" type="button" onClick={() => onNavigate('reports')}>
              الموسم الحالي 🏆
            </button>
          </div>

          {/* Top 3 Podium */}
          <div className="empire-podium">
            {/* 2nd Place */}
            <div className="empire-podium-spot empire-podium--2">
              <div className="empire-podium-avatar">{leaderboardTop3[1].avatar}</div>
              <strong>{leaderboardTop3[1].name}</strong>
              <small>{leaderboardTop3[1].score}</small>
              <div className="empire-podium-block">2</div>
            </div>

            {/* 1st Place */}
            <div className="empire-podium-spot empire-podium--1">
              <div className="empire-podium-crown">👑</div>
              <div className="empire-podium-avatar empire-podium-avatar--gold">{leaderboardTop3[0].avatar}</div>
              <strong>{leaderboardTop3[0].name}</strong>
              <small>{leaderboardTop3[0].score}</small>
              <div className="empire-podium-block empire-podium-block--gold">1</div>
            </div>

            {/* 3rd Place */}
            <div className="empire-podium-spot empire-podium--3">
              <div className="empire-podium-avatar">{leaderboardTop3[2].avatar}</div>
              <strong>{leaderboardTop3[2].name}</strong>
              <small>{leaderboardTop3[2].score}</small>
              <div className="empire-podium-block">3</div>
            </div>
          </div>

          {/* Ranks 4 to 10 */}
          <div className="empire-leaderboard-list">
            {leaderboardRanks.map((player) => (
              <div className={`empire-lb-row ${player.rank === 6 ? 'is-player' : ''}`} key={player.rank}>
                <span className="empire-lb-rank">{player.rank}</span>
                <span className="empire-lb-name">{player.name}</span>
                <strong className="empire-lb-score">{player.score}</strong>
              </div>
            ))}
          </div>

          <button className="empire-btn-teal-wide" type="button" onClick={() => onNavigate('reports')}>
            تفاصيل الموسم 📊
          </button>
        </section>
      </div>

      {/* Story Campaign Modal */}
      {campaignOpen && (
        <StoryCampaignHub
          profile={profile}
          country={country}
          onClose={() => setCampaignOpen(false)}
          onClaimReward={(diamonds, gold, money, reputation) => {
            if (diamonds > 0) profile.diamonds = (profile.diamonds ?? 0) + diamonds;
            if (gold > 0) profile.goldGrams = (profile.goldGrams ?? 0) + gold;
            if (money > 0) profile.bankBalance += money;
            if (reputation) profile.reputation = Math.min(100, Math.max(0, (profile.reputation ?? 50) + reputation));
            const currentChapterId = (profile as unknown as { campaignChapterId?: number }).campaignChapterId ?? 1;
            (profile as unknown as { campaignChapterId?: number }).campaignChapterId = currentChapterId + 1;
          }}
        />
      )}
    </div>
  );
}
