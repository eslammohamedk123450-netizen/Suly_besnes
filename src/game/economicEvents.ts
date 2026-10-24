import type { IndustryId } from '../domain/countries';

export interface EconomicEventTemplate {
  title: string;
  description: string;
  cashImpact: number;
  industryId?: IndustryId;
  materialId?: string;
  productId?: string;
  materialPriceMultiplier?: number;
  demandMultiplier?: number;
  durationDays?: number;
}

export const ECONOMIC_EVENT_TEMPLATES: readonly EconomicEventTemplate[] = [
  { title: 'طلب محلي مرتفع', description: 'يزداد الطلب اليومي على عبوات الأغذية بنسبة ٢٠٪ لمدة ٣ أيام.', cashImpact: 18_000, industryId: 'food', productId: 'food-pack', demandMultiplier: 1.2, durationDays: 3 },
  { title: 'ارتفاع لوجستي مؤقت', description: 'يرتفع سعر وقود التشغيل بنسبة ١٠٪ لمدة يومين بسبب ضغط النقل.', cashImpact: -14_000, industryId: 'transport', materialId: 'fuel', materialPriceMultiplier: 1.1, durationDays: 2 },
  { title: 'يوم استقرار اقتصادي', description: 'الأسعار والطلب مستقران اليوم، ولا يوجد أثر سوقي إضافي.', cashImpact: 0 },
  { title: 'منحة دعم للمصانع الصغيرة', description: 'دعم مالي مخصص لشركات الأغذية الصغيرة.', cashImpact: 26_000, industryId: 'food' },
  { title: 'نقص مؤقت في المواد الخام', description: 'يقل المعروض من الفولاذ، فيرتفع سعره بنسبة ٢٥٪ لمدة ٤ أيام.', cashImpact: -22_000, industryId: 'construction', materialId: 'steel', materialPriceMultiplier: 1.25, durationDays: 4 },
  { title: 'فرصة تصدير استثنائية', description: 'يرتفع الطلب على الأجهزة الإلكترونية بنسبة ٢٠٪ لمدة ٣ أيام.', cashImpact: 34_000, industryId: 'electronics', productId: 'electronics', demandMultiplier: 1.2, durationDays: 3 },
  { title: 'فحص تنظيمي وتكاليف امتثال', description: 'تكاليف امتثال إضافية على قطاع البترول.', cashImpact: -18_000, industryId: 'petroleum' },
  { title: 'موسم تجاري قوي', description: 'موسم بيع قوي يرفع الطلب على عبوات الأغذية بنسبة ٢٥٪ لمدة ٥ أيام.', cashImpact: 42_000, industryId: 'food', productId: 'food-pack', demandMultiplier: 1.25, durationDays: 5 },
];

export function getEconomicEventTemplate(day: number): EconomicEventTemplate {
  const index = Math.max(0, Math.floor(day) - 1) % ECONOMIC_EVENT_TEMPLATES.length;
  return ECONOMIC_EVENT_TEMPLATES[index];
}
