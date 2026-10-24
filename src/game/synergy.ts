import type { PlayerProfile } from '../domain/player';

export interface SynergyBonus {
  id: string;
  title: string;
  description: string;
  companyIds: string[];
  costMultiplier: number;
  productionMultiplier: number;
}

export function getSynergyBonuses(profile: PlayerProfile): SynergyBonus[] {
  const companies = profile.companies;
  const has = (industryId: string) => companies.filter((company) => company.industryId === industryId);
  const bonuses: SynergyBonus[] = [];
  const food = has('food');
  const transport = has('transport');
  const production = companies.filter((company) => !['transport', 'food'].includes(company.industryId));
  if (food.length > 0 && transport.length > 0) bonuses.push({ id: 'supply-chain', title: 'سلسلة الغذاء والنقل', description: 'ربط الأغذية بالنقل يخفض تكلفة التشغيل 8% ويحسن كفاءة الإنتاج 5%.', companyIds: [...food, ...transport].map((company) => company.id), costMultiplier: 0.92, productionMultiplier: 1.05 });
  if (transport.length > 0 && production.length > 0) bonuses.push({ id: 'industrial-logistics', title: 'لوجستيات الإنتاج', description: 'شركة النقل تخدم خطوط الإنتاج وتخفض تكلفة التشغيل اللوجستي 6%.', companyIds: [...transport, ...production].map((company) => company.id), costMultiplier: 0.94, productionMultiplier: 1 });
  if (companies.length >= 2 && profile.inventory.some((lot) => lot.quantity > 0)) bonuses.push({ id: 'shared-warehouse', title: 'مخزن مشترك', description: 'تعدد الشركات مع مخزون قائم يقلل مصروف التشغيل 3%.', companyIds: companies.map((company) => company.id), costMultiplier: 0.97, productionMultiplier: 1 });
  return bonuses;
}

export function getSynergyOperatingMultiplier(profile: PlayerProfile): number {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.costMultiplier, 1);
}

export function getSynergyProductionMultiplier(profile: PlayerProfile): number {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.productionMultiplier, 1);
}
