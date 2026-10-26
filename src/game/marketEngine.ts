export interface AiRival {
  id: string;
  name: string;
  avatar: string;
  netWorth: number;
  strategy: string;
  activeSector: string;
}

export interface MarketNewsEvent {
  id: string;
  title: string;
  summary: string;
  impactType: 'bullish' | 'bearish' | 'neutral';
  affectedSector: string;
  priceMultiplier: number;
  timestampDay: number;
}

export const AI_RIVALS: AiRival[] = [
  {
    id: 'rival_1',
    name: 'مجمع الأهرام للتجارة',
    avatar: '🏛️',
    netWorth: 15_500_000,
    strategy: 'احتكار المواد الخام والأغذية',
    activeSector: 'الأغذية والزراعة',
  },
  {
    id: 'rival_2',
    name: 'شركة الدلتا اللوجستية',
    avatar: '🚢',
    netWorth: 28_000_000,
    strategy: 'السيطرة على الموانئ وعقود الشحن',
    activeSector: 'النقل واللوجستيات',
  },
  {
    id: 'rival_3',
    name: 'مؤسسة الفراعنة للطاقة',
    avatar: '⚡',
    netWorth: 45_000_000,
    strategy: 'الاستحواذ على محطات الكهرباء والبترول',
    activeSector: 'البترول والطاقة',
  },
  {
    id: 'rival_4',
    name: 'شركة كليوباترا للاستثمار',
    avatar: '💎',
    netWorth: 80_000_000,
    strategy: 'المزايدة الكبرى في البورصة والمزادات',
    activeSector: 'العقارات والمالية',
  },
];

export function generateDynamicMarketEvents(currentDay: number): MarketNewsEvent[] {
  const events: MarketNewsEvent[] = [
    {
      id: `event_steel_${currentDay}`,
      title: '📈 طفرة في أسعار الفولاذ والحديد (+25%)',
      summary: 'زيادة الطلب في مشاريع البناء الضخمة تنعش أرباح قطاع مواد البناء والمصانع.',
      impactType: 'bullish',
      affectedSector: 'مواد البناء',
      priceMultiplier: 1.25,
      timestampDay: currentDay,
    },
    {
      id: `event_energy_${currentDay}`,
      title: '⚡ ارتفاع تكاليف الطاقة الكهربائية العالمية',
      summary: 'تحالف الفراعنة يعلن إعادة هيكلة خطوط الطاقة، مما يزيد تكاليف تشغيل المصانع القديمة بنسبة 15%.',
      impactType: 'bearish',
      affectedSector: 'المصانع والإنتاج',
      priceMultiplier: 0.85,
      timestampDay: currentDay,
    },
    {
      id: `event_crop_${currentDay}`,
      title: '🌾 موسم حصاد استثنائي على ضفاف النيل',
      summary: 'وفرة المحاصيل تدعم شركات الأغذية وتخفض تكاليف شراء المواد الخام الزراعية.',
      impactType: 'bullish',
      affectedSector: 'الأغذية والزراعة',
      priceMultiplier: 1.3,
      timestampDay: currentDay,
    },
    {
      id: `event_oil_${currentDay}`,
      title: '⛽ اكتشاف حقل بترول جديد ومنافسة بالمزادات',
      summary: 'مجمع الأهرام يبدأ المزايدة على حقوق التكرير مما يزيد نشاط التداول التجاري.',
      impactType: 'bullish',
      affectedSector: 'البترول والغاز',
      priceMultiplier: 1.2,
      timestampDay: currentDay,
    },
  ];

  return events;
}

export function getCurrentMarketNews(day: number): MarketNewsEvent {
  const events = generateDynamicMarketEvents(day);
  const index = Math.abs(day) % events.length;
  return events[index];
}
