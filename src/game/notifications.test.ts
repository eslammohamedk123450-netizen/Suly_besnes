import { describe, expect, it } from 'vitest';
import { findCountry } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import { advanceDay, buyDirectCompany, buyDirectLand, updateNotificationState } from './engine';
import { selectNotifications } from './notifications';

const completedOrder = {
  id: 'order-new', companyId: 'company-1', productId: 'food-pack', productName: 'غذاء', batches: 1,
  outputQuantity: 20, outputUnit: 'عبوة', materialCost: 500, energyCost: 20, expectedUnitCost: 25,
  demandForecast: 100, qualityScore: 90, maintenanceCost: 0, startedOnDay: 1, completesOnDay: 2, status: 'completed' as const,
};

function profile() {
  const base = createNewPlayer(findCountry('egypt')!, 'اختبار', new Date('2026-01-01T00:00:00.000Z'));
  base.onboarding.introCompleted = true;
  base.onboarding.countryIntroSeen = true;
  return base;
}

describe('notification state and destinations', () => {
  it('announces only production explicitly completed since the previous acknowledgement', () => {
    const base = profile();
    const historical = { ...completedOrder, id: 'old-order' };
    const oldOnly = { ...base, productionOrders: [historical], unreadProductionOrderIds: [] };
    expect(selectNotifications(oldOnly).some((item) => item.section === 'production')).toBe(false);

    const fresh = { ...base, productionOrders: [historical, completedOrder], unreadProductionOrderIds: ['order-new'] };
    const alert = selectNotifications(fresh).find((item) => item.section === 'production');
    expect(alert).toMatchObject({ id: 'production-completed:order-new', count: 1, target: 'production-queue' });
    expect(alert?.detail).toContain('٢٠');
  });

  it('persists read and dismissed states and clears only the acknowledged production IDs', () => {
    const base = { ...profile(), productionOrders: [completedOrder], unreadProductionOrderIds: ['order-new', 'order-pending'] };
    const productionAlert = selectNotifications(base).find((item) => item.section === 'production')!;
    const read = updateNotificationState(base, 'read', [productionAlert.id]);
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(read.profile.readNotificationIds).toContain(productionAlert.id);
    expect(read.profile.unreadProductionOrderIds).toEqual(['order-pending']);
    expect(selectNotifications(read.profile).some((item) => item.section === 'production')).toBe(false);

    const allIds = selectNotifications(read.profile).map((item) => item.id);
    const dismissed = updateNotificationState(read.profile, 'dismiss', allIds);
    expect(dismissed.ok).toBe(true);
    if (dismissed.ok) expect(selectNotifications(dismissed.profile)).toEqual([]);
  });

  it('announces land and company availability once the ownership-transfer day has passed', () => {
    const landPurchase = buyDirectLand({ ...profile(), bankBalance: 2_000_000 }, 'starter-village-land');
    expect(landPurchase.ok).toBe(true);
    if (!landPurchase.ok) return;
    const landNoticeId = `ownership-transfer-land:${landPurchase.data.landId}:2`;
    expect(selectNotifications(landPurchase.profile).some((item) => item.id === landNoticeId)).toBe(false);
    const landDay = advanceDay(landPurchase.profile);
    expect(landDay.ok).toBe(true);
    if (!landDay.ok) return;
    expect(selectNotifications(landDay.profile)).toContainEqual(expect.objectContaining({
      id: landNoticeId,
      title: 'اكتمل نقل ملكية الأرض',
      section: 'lands',
    }));

    const companyPurchase = buyDirectCompany({ ...profile(), bankBalance: 2_000_000 }, 'direct-company-food');
    expect(companyPurchase.ok).toBe(true);
    if (!companyPurchase.ok) return;
    const companyDay = advanceDay(companyPurchase.profile);
    expect(companyDay.ok).toBe(true);
    if (!companyDay.ok) return;
    expect(selectNotifications(companyDay.profile)).toContainEqual(expect.objectContaining({
      id: `ownership-transfer-company:${companyPurchase.data.companyId}:2`,
      title: 'اكتمل نقل ملكية الشركة',
      section: 'companies',
    }));
  });

  it('routes grouped alerts to the intended actionable screens once those sections are unlocked', () => {
    const base = profile();
    const alerts = selectNotifications({
      ...base,
      level: 5,
      payables: 2_000,
      staff: [{ id: 'staff-1', name: 'موظف', role: 'accountant', dailySalary: 1_000, hiredOnDay: 1, nextPayDay: 2, status: 'active', unpaidSalary: 1_000 }],
      productionOrders: [completedOrder],
      unreadProductionOrderIds: ['order-new'],
      banking: { deposits: [], loans: [{ id: 'loan-1', collateralType: 'land', collateralId: 'land-1', principal: 5_000, totalRepayment: 6_000, annualRate: 0.1, startedOnDay: 1, termDays: 7, nextPaymentDay: 2, installmentAmount: 1_000, remainingBalance: 6_000, status: 'active' }] },
      contracts: [{ id: 'contract-1', clientName: 'عميل', clientType: 'budget', productId: 'food-pack', productName: 'غذاء', quantity: 1, unitPrice: 100, reward: 10, reputationReward: 1, deadlineDay: 2, acceptedOnDay: 1, status: 'active' }],
      events: [{ id: 'event-1', day: 1, title: 'حدث تجاري', cashImpact: 100, occurredAt: '2026-01-01T00:00:00.000Z' }],
    });
    const byId = new Map(alerts.map((item) => [item.id, item]));
    expect(byId.get('salary-overdue')).toMatchObject({ section: 'staff', target: 'staff-list' });
    expect(byId.get('payables')).toMatchObject({ section: 'obligations', target: 'obligations-list' });
    expect(byId.get('loans-due')).toMatchObject({ section: 'bank', target: 'loans' });
    expect(byId.get('contracts-due')).toMatchObject({ section: 'contracts', target: 'contracts-active' });
    expect([...byId.values()].find((item) => item.section === 'production')).toMatchObject({ section: 'production', target: 'production-queue' });
    expect([...byId.values()].find((item) => item.section === 'reports')).toMatchObject({ section: 'reports', target: 'economic-events' });
  });
});
