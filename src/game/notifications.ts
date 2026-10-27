import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { isNotificationAllowedForProfile } from './progressionEngine';
import { selectAvailableAuctions, selectEmpirePulse } from './selectors';
import { selectEmpireOperationalAlerts } from './empireExpansionEngine';

export type NotificationTone = 'warning' | 'success' | 'info' | 'danger';
export interface GameNotification {
  id: string;
  title: string;
  detail: string;
  tone: NotificationTone;
  section: SectionId;
  count?: number;
  target?: string;
}

function money(value: number): string {
  return `${Math.round(value).toLocaleString('ar-EG')} $`;
}

function plural(count: number, one: string, two: string, many: string): string {
  return count === 1 ? one : count === 2 ? two : many;
}

export function selectNotifications(profile: PlayerProfile): GameNotification[] {
  const notifications: GameNotification[] = [];

  // 1. Overdue Staff Salaries (ONLY when 'staff' section is unlocked AND active staff exist)
  const unpaidSalary = profile.staff.filter((item) => item.status === 'active' && (item.unpaidSalary ?? 0) > 0);
  if (
    unpaidSalary.length > 0
    && isNotificationAllowedForProfile(profile, { section: 'staff', requiresActiveStaff: true })
  ) {
    const salaryTotal = unpaidSalary.reduce((sum, item) => sum + (item.unpaidSalary ?? 0), 0);
    notifications.push({
      id: 'salary-overdue',
      title: 'رواتب متأخرة',
      detail: `يوجد ${unpaidSalary.length} ${plural(unpaidSalary.length, 'موظف', 'موظفان', 'موظفين')} · الإجمالي ${money(salaryTotal)}.`,
      tone: 'danger',
      section: 'staff',
      count: unpaidSalary.length,
      target: 'staff-list',
    });
  }

  // 2. Unpaid Payables (Obligations is unlocked from Level 1)
  if (profile.payables > 0 && isNotificationAllowedForProfile(profile, { section: 'obligations' })) {
    notifications.push({
      id: 'payables',
      title: 'التزامات غير مسددة',
      detail: `إجمالي الالتزامات ${money(profile.payables)} وتؤثر على الطاقة.`,
      tone: 'danger',
      section: 'obligations',
      target: 'obligations-list',
    });
  }

  // 3. Newly Completed Production (ONLY when 'production' section is unlocked)
  if (isNotificationAllowedForProfile(profile, { section: 'production' })) {
    const newlyCompleted = (profile.unreadProductionOrderIds ?? [])
      .slice(0, 5)
      .map((id) => profile.productionOrders.find((item) => item.id === id && item.status === 'completed'))
      .filter((item): item is PlayerProfile['productionOrders'][number] => Boolean(item));
    if (newlyCompleted.length > 0) {
      const output = newlyCompleted.reduce((sum, item) => sum + item.outputQuantity, 0);
      const ids = newlyCompleted.map((item) => item.id);
      notifications.push({
        id: `production-completed:${ids.join(',')}`,
        title: 'إنتاج مكتمل',
        detail: `اكتملت ${newlyCompleted.length} أوامر إنتاج جديدة · إجمالي ${output.toLocaleString('ar-EG')} وحدة جاهزة في المخزن.`,
        tone: 'success',
        section: 'production',
        count: newlyCompleted.length,
        target: 'production-queue',
      });
    }
  }

  // 4. Land Ownership Transfer Complete
  if (isNotificationAllowedForProfile(profile, { section: 'lands' })) {
    const ownedLandIds = new Set(profile.companies.map((company) => company.landId));
    for (const land of profile.lands) {
      if (ownedLandIds.has(land.id) || land.availableForCompanyOnDay === undefined || land.availableForCompanyOnDay > profile.day) continue;
      notifications.push({
        id: `ownership-transfer-land:${land.id}:${land.availableForCompanyOnDay}`,
        title: 'اكتمل نقل ملكية الأرض',
        detail: `أصبحت ${land.label} متاحة للتأسيس بعد انتهاء فترة نقل الملكية.`,
        tone: 'success',
        section: 'lands',
      });
    }
  }

  // 5. Company Ownership Transfer Complete
  if (isNotificationAllowedForProfile(profile, { section: 'companies' })) {
    for (const company of profile.companies) {
      if (company.operationalFromDay === undefined || company.operationalFromDay > profile.day) continue;
      notifications.push({
        id: `ownership-transfer-company:${company.id}:${company.operationalFromDay}`,
        title: 'اكتمل نقل ملكية الشركة',
        detail: `أصبحت ${company.name} جاهزة لبدء التشغيل بعد انتهاء فترة نقل الملكية.`,
        tone: 'success',
        section: 'companies',
      });
    }
  }

  // 6. Loans Due Soon: Route to 'bank' ONLY if 'bank' is unlocked; otherwise route inherited-loan reminder safely to 'obligations'
  const dueLoans = profile.banking.loans.filter((loan) => loan.status === 'active' && loan.nextPaymentDay - profile.day <= 2);
  if (dueLoans.length > 0) {
    const dueTotal = dueLoans.reduce((sum, loan) => sum + Math.min(loan.remainingBalance, loan.installmentAmount), 0);
    const nearestDay = Math.min(...dueLoans.map((loan) => loan.nextPaymentDay));
    if (isNotificationAllowedForProfile(profile, { section: 'bank', requiresActiveLoans: true })) {
      notifications.push({
        id: 'loans-due',
        title: 'أقساط قروض قريبة',
        detail: `يوجد ${dueLoans.length} ${plural(dueLoans.length, 'قسط قرض', 'قسطا قرض', 'أقساط قروض')} · مجموعها ${money(dueTotal)} · أقرب استحقاق اليوم ${nearestDay}.`,
        tone: 'warning',
        section: 'bank',
        count: dueLoans.length,
        target: 'loans',
      });
    } else if (isNotificationAllowedForProfile(profile, { section: 'obligations' })) {
      notifications.push({
        id: 'inherited-loan-grace',
        title: 'اقتراب نهاية مهلة القرض الموروث',
        detail: `يستحق قسط القرض الموروث (${money(dueTotal)}) في اليوم ${nearestDay}. راجع قسم الالتزامات للسداد.`,
        tone: 'warning',
        section: 'obligations',
        count: dueLoans.length,
        target: 'obligations-list',
      });
    }
  }

  // 7. Contracts Approaching Deadline (ONLY when 'contracts' section is unlocked AND active contracts exist)
  const dueContracts = profile.contracts.filter((contract) => contract.status === 'active' && contract.deadlineDay - profile.day <= 2);
  if (
    dueContracts.length > 0
    && isNotificationAllowedForProfile(profile, { section: 'contracts', requiresActiveContracts: true })
  ) {
    const contractValue = dueContracts.reduce((sum, contract) => sum + contract.quantity * contract.unitPrice + contract.reward, 0);
    const nearestDay = Math.min(...dueContracts.map((contract) => contract.deadlineDay));
    notifications.push({
      id: 'contracts-due',
      title: 'عقود تقترب من الموعد',
      detail: `يوجد ${dueContracts.length} عقود قريبة · قيمة التسليم ${money(contractValue)} · أقرب موعد اليوم ${nearestDay}.`,
      tone: 'warning',
      section: 'contracts',
      count: dueContracts.length,
      target: 'contracts-active',
    });
  }

  // 8. Macro Economic Events Summary (ONLY when 'reports' is unlocked)
  const recentEvents = profile.events.slice(-3).reverse();
  if (recentEvents.length > 0 && isNotificationAllowedForProfile(profile, { section: 'reports' })) {
    const eventImpact = recentEvents.reduce((sum, event) => sum + event.cashImpact, 0);
    notifications.push({
      id: `economic-events-${recentEvents[0].id}`,
      title: 'ملخص الأحداث الاقتصادية',
      detail: `${recentEvents.length} أحداث حديثة · ${recentEvents.map((event) => event.title).join('، ')} · الأثر الصافي ${eventImpact >= 0 ? '+' : '−'}${money(Math.abs(eventImpact))}`,
      tone: eventImpact >= 0 ? 'success' : 'warning',
      section: 'reports',
      count: recentEvents.length,
      target: 'economic-events',
    });
  }

  // 9. Open Auctions (ONLY when 'auctions' is unlocked)
  if (isNotificationAllowedForProfile(profile, { section: 'auctions' })) {
    const auctions = selectAvailableAuctions(profile);
    if (auctions.length > 0) {
      notifications.push({
        id: 'auctions-open',
        title: 'فرص مزادات متاحة',
        detail: `يوجد ${auctions.length} ${plural(auctions.length, 'مزاد مفتوح', 'مزادان مفتوحان', 'مزادات مفتوحة')} للمنافسة الآن.`,
        tone: 'info',
        section: 'auctions',
        count: auctions.length,
        target: 'auctions-list',
      });
    }
  }

  // 10. Earned Empire Badges
  if (isNotificationAllowedForProfile(profile, { section: 'home' })) {
    const earnedBadges = selectEmpirePulse(profile).badges.filter((badge) => badge.earned);
    if (earnedBadges.length > 0) {
      notifications.push({
        id: 'badges-earned',
        title: 'شارات الإمبراطورية',
        detail: `لديك ${earnedBadges.length} شارات مكتسبة: ${earnedBadges.slice(-3).map((badge) => badge.label).join('، ')}.`,
        tone: 'success',
        section: 'home',
        count: earnedBadges.length,
      });
    }
  }

  // 11. Global Raw Materials Market (ONLY when 'inventory' is unlocked)
  if (isNotificationAllowedForProfile(profile, { section: 'inventory' })) {
    notifications.push({
      id: 'global-market-open',
      title: 'السوق العالمي مفتوح',
      detail: 'عروض تجار المواد الخام متاحة، وبعضها يقبل التفاوض.',
      tone: 'info',
      section: 'inventory',
    });
  }

  // 12. Empire Facility Halts & Raw Material Shortages
  if (isNotificationAllowedForProfile(profile, { section: 'empire' })) {
    const empireAlerts = selectEmpireOperationalAlerts(profile);
    const prodHalts = empireAlerts.filter(
      (a) => a.category === 'production' && a.severity === 'critical',
    );
    if (prodHalts.length > 0) {
      notifications.unshift({
        id: `empire-halted-facilities:${prodHalts.map((a) => a.facilityId ?? a.id).join(',')}`,
        title: 'منشآت متوقفة عن الإنتاج',
        detail: `${prodHalts[0].title} — افتح مركز إدارة الإمبراطورية لمعالجة السبب.`,
        tone: 'danger',
        section: 'empire',
        count: prodHalts.length,
        target: 'alerts',
      });
    }
    const rawShortages = empireAlerts.filter((a) => a.category === 'inventory');
    if (rawShortages.length > 0) {
      notifications.push({
        id: `empire-material-shortage:${rawShortages.map((a) => a.facilityId ?? a.id).join(',')}`,
        title: 'تنبيه نقص مخزون التشغيل',
        detail: `${rawShortages.length} تنبيه مخزون نشط (${rawShortages[0].title}).`,
        tone: 'warning',
        section: 'empire',
        count: rawShortages.length,
        target: 'alerts',
      });
    }
  }

  // Deduplicate by ID and exclude dismissed notifications
  const dismissed = new Set(profile.dismissedNotificationIds ?? []);
  const seenIds = new Set<string>();
  return notifications
    .filter((notification) => {
      if (dismissed.has(notification.id) || seenIds.has(notification.id)) return false;
      seenIds.add(notification.id);
      return true;
    })
    .slice(0, 10);
}
