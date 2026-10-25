import type { PlayerProfile } from '../domain/player';
import { selectAvailableAuctions } from './selectors';
import { selectEmpirePulse } from './selectors';

export type NotificationTone = 'warning' | 'success' | 'info' | 'danger';
export interface GameNotification {
  id: string;
  title: string;
  detail: string;
  tone: NotificationTone;
  section: 'home' | 'contracts' | 'staff' | 'bank' | 'auctions' | 'reports' | 'obligations' | 'companies' | 'lands' | 'production' | 'inventory';
  count?: number;
  target?: string;
}
function money(value: number): string { return `${Math.round(value).toLocaleString('ar-EG')} $`; }
function plural(count: number, one: string, two: string, many: string): string { return count === 1 ? one : count === 2 ? two : many; }

export function selectNotifications(profile: PlayerProfile): GameNotification[] {
  const notifications: GameNotification[] = [];
  const unpaidSalary = profile.staff.filter((item) => item.status === 'active' && (item.unpaidSalary ?? 0) > 0);
  const salaryTotal = unpaidSalary.reduce((sum, item) => sum + (item.unpaidSalary ?? 0), 0);
  if (unpaidSalary.length > 0) {
    notifications.push({ id: 'salary-overdue', title: 'رواتب متأخرة', detail: `يوجد ${unpaidSalary.length} ${plural(unpaidSalary.length, 'موظف', 'موظفان', 'موظفين')} · الإجمالي ${money(salaryTotal)}.`, tone: 'danger', section: 'staff', count: unpaidSalary.length, target: 'staff-list' });
  }
  if (profile.payables > 0) {
    notifications.push({ id: 'payables', title: 'التزامات غير مسددة', detail: `إجمالي الالتزامات ${money(profile.payables)} وتؤثر على الطاقة.`, tone: 'danger', section: 'obligations', target: 'obligations-list' });
  }
  const newlyCompleted = (profile.unreadProductionOrderIds ?? []).slice(0, 5).map((id) => profile.productionOrders.find((item) => item.id === id && item.status === 'completed')).filter((item): item is PlayerProfile['productionOrders'][number] => Boolean(item));
  if (newlyCompleted.length > 0) {
    const output = newlyCompleted.reduce((sum, item) => sum + item.outputQuantity, 0);
    const ids = newlyCompleted.map((item) => item.id);
    notifications.push({ id: `production-completed:${ids.join(',')}`, title: 'إنتاج مكتمل', detail: `اكتملت ${newlyCompleted.length} أوامر إنتاج جديدة · إجمالي ${output.toLocaleString('ar-EG')} وحدة جاهزة في المخزن.`, tone: 'success', section: 'production', count: newlyCompleted.length, target: 'production-queue' });
  }
  const ownedLandIds = new Set(profile.companies.map((company) => company.landId));
  for (const land of profile.lands) {
    if (ownedLandIds.has(land.id) || land.availableForCompanyOnDay === undefined || land.availableForCompanyOnDay > profile.day) continue;
    notifications.push({ id: `ownership-transfer-land:${land.id}:${land.availableForCompanyOnDay}`, title: 'اكتمل نقل ملكية الأرض', detail: `أصبحت ${land.label} متاحة للتأسيس بعد انتهاء فترة نقل الملكية.`, tone: 'success', section: 'lands' });
  }
  for (const company of profile.companies) {
    if (company.operationalFromDay === undefined || company.operationalFromDay > profile.day) continue;
    notifications.push({ id: `ownership-transfer-company:${company.id}:${company.operationalFromDay}`, title: 'اكتمل نقل ملكية الشركة', detail: `أصبحت ${company.name} جاهزة لبدء التشغيل بعد انتهاء فترة نقل الملكية.`, tone: 'success', section: 'companies' });
  }
  const dueLoans = profile.banking.loans.filter((loan) => loan.status === 'active' && loan.nextPaymentDay - profile.day <= 2);
  if (dueLoans.length > 0) {
    const dueTotal = dueLoans.reduce((sum, loan) => sum + Math.min(loan.remainingBalance, loan.installmentAmount), 0);
    const nearestDay = Math.min(...dueLoans.map((loan) => loan.nextPaymentDay));
    notifications.push({ id: 'loans-due', title: 'أقساط قروض قريبة', detail: `يوجد ${dueLoans.length} ${plural(dueLoans.length, 'قسط قرض', 'قسطا قرض', 'أقساط قروض')} · مجموعها ${money(dueTotal)} · أقرب استحقاق اليوم ${nearestDay}.`, tone: 'warning', section: 'bank', count: dueLoans.length, target: 'loans' });
  }
  const dueContracts = profile.contracts.filter((contract) => contract.status === 'active' && contract.deadlineDay - profile.day <= 2);
  if (dueContracts.length > 0) {
    const contractValue = dueContracts.reduce((sum, contract) => sum + contract.quantity * contract.unitPrice + contract.reward, 0);
    const nearestDay = Math.min(...dueContracts.map((contract) => contract.deadlineDay));
    notifications.push({ id: 'contracts-due', title: 'عقود تقترب من الموعد', detail: `يوجد ${dueContracts.length} عقود قريبة · قيمة التسليم ${money(contractValue)} · أقرب موعد اليوم ${nearestDay}.`, tone: 'warning', section: 'contracts', count: dueContracts.length, target: 'contracts-active' });
  }
  const recentEvents = profile.events.slice(-3).reverse();
  if (recentEvents.length > 0) {
    const eventImpact = recentEvents.reduce((sum, event) => sum + event.cashImpact, 0);
    notifications.push({ id: `economic-events-${recentEvents[0].id}`, title: 'ملخص الأحداث الاقتصادية', detail: `${recentEvents.length} أحداث حديثة · ${recentEvents.map((event) => event.title).join('، ')} · الأثر الصافي ${eventImpact >= 0 ? '+' : '−'}${money(Math.abs(eventImpact))}`, tone: eventImpact >= 0 ? 'success' : 'warning', section: 'reports', count: recentEvents.length, target: 'economic-events' });
  }
  const auctions = selectAvailableAuctions(profile);
  if (auctions.length > 0) notifications.push({ id: 'auctions-open', title: 'فرص مزادات متاحة', detail: `يوجد ${auctions.length} ${plural(auctions.length, 'مزاد مفتوح', 'مزادان مفتوحان', 'مزادات مفتوحة')} للمنافسة الآن.`, tone: 'info', section: 'auctions', count: auctions.length, target: 'auctions-list' });
  const earnedBadges = selectEmpirePulse(profile).badges.filter((badge) => badge.earned);
  if (earnedBadges.length > 0) notifications.push({ id: 'badges-earned', title: 'شارات الإمبراطورية', detail: `لديك ${earnedBadges.length} شارات مكتسبة: ${earnedBadges.slice(-3).map((badge) => badge.label).join('، ')}.`, tone: 'success', section: 'home', count: earnedBadges.length });
  notifications.push({ id: 'global-market-open', title: 'السوق العالمي مفتوح', detail: 'عروض تجار المواد الخام متاحة، وبعضها يقبل التفاوض.', tone: 'info', section: 'inventory' });
  const dismissed = new Set(profile.dismissedNotificationIds ?? []);
  return notifications.filter((notification) => !dismissed.has(notification.id)).slice(0, 10);
}
