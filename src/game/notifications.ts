import type { PlayerProfile } from '../domain/player';
import { selectAvailableAuctions } from './selectors';
import { selectEmpirePulse } from './selectors';

export type NotificationTone = 'warning' | 'success' | 'info' | 'danger';
export interface GameNotification {
  id: string;
  title: string;
  detail: string;
  tone: NotificationTone;
  section: 'home' | 'contracts' | 'staff' | 'bank' | 'auctions' | 'reports' | 'obligations' | 'companies' | 'inventory';
}

export function selectNotifications(profile: PlayerProfile): GameNotification[] {
  const notifications: GameNotification[] = [];
  const unpaidSalary = profile.staff.filter((item) => item.status === 'active' && (item.unpaidSalary ?? 0) > 0);
  if (unpaidSalary.length > 0) {
    notifications.push({ id: 'salary-overdue', title: 'رواتب متأخرة', detail: `لديك ${unpaidSalary.length} موظف يحتاج إلى تسوية راتبه.`, tone: 'danger', section: 'staff' });
  }
  if (profile.payables > 0) {
    notifications.push({ id: 'payables', title: 'التزامات غير مسددة', detail: `الرصيد المستحق ${Math.round(profile.payables).toLocaleString('ar-EG')} ج.م ويؤثر على الطاقة.`, tone: 'danger', section: 'obligations' });
  }
  profile.productionOrders.filter((item) => item.status === 'completed').slice(-3).forEach((order) => {
    notifications.push({ id: `production-${order.id}`, title: 'اكتمل الإنتاج', detail: `${order.productName} جاهز في المخزن (${order.outputQuantity} وحدة).`, tone: 'success', section: 'companies' });
  });
  profile.banking.loans.filter((loan) => loan.status === 'active' && loan.nextPaymentDay - profile.day <= 2).forEach((loan) => {
    notifications.push({ id: `loan-${loan.id}`, title: 'قسط قرض قريب', detail: `يستحق القسط في اليوم ${loan.nextPaymentDay}.`, tone: 'warning', section: 'bank' });
  });
  profile.contracts.filter((contract) => contract.status === 'active' && contract.deadlineDay - profile.day <= 2).forEach((contract) => {
    notifications.push({ id: `contract-${contract.id}`, title: 'عقد يقترب من الموعد', detail: `${contract.clientName} · الموعد اليوم ${contract.deadlineDay}.`, tone: 'warning', section: 'contracts' });
  });
  profile.events.slice(-3).reverse().forEach((event) => {
    notifications.push({ id: event.id, title: 'تغير اقتصادي', detail: `${event.title} · ${event.cashImpact >= 0 ? '+' : '−'}${Math.abs(event.cashImpact).toLocaleString('ar-EG')} ج.م`, tone: event.cashImpact >= 0 ? 'success' : 'warning', section: 'reports' });
  });
  if (selectAvailableAuctions(profile).length > 0) {
    notifications.push({ id: 'auctions-open', title: 'فرص مزادات متاحة', detail: 'توجد أصول أو شحنات يمكن المنافسة عليها الآن.', tone: 'info', section: 'auctions' });
  }
  selectEmpirePulse(profile).badges.filter((badge) => badge.earned).slice(-3).forEach((badge) => {
    notifications.push({ id: `badge-${badge.id}`, title: 'شارة إمبراطورية مكتسبة', detail: `أصبحت شارة «${badge.label}» ضمن إنجازاتك.`, tone: 'success', section: 'home' });
  });
  notifications.push({ id: 'global-market-open', title: 'السوق العالمي مفتوح', detail: 'تتوفر عروض روبوتية جديدة للمواد الخام، وبعضها يقبل التفاوض.', tone: 'info', section: 'inventory' });
  return notifications.slice(0, 12);
}
