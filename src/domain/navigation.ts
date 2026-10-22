import type { IconName } from '../components/Icon';

export type SectionId =
  | 'home'
  | 'auctions'
  | 'companies'
  | 'investments'
  | 'lands'
  | 'production'
  | 'inventory'
  | 'reports'
  | 'tasks'
  | 'settings';

export interface SectionItem {
  id: SectionId;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: IconName;
}

export const GAME_SECTIONS: readonly SectionItem[] = [
  { id: 'home', label: 'الرئيسية', shortLabel: 'الرئيسية', subtitle: 'ملخص إمبراطوريتك', icon: 'home' },
  { id: 'auctions', label: 'المزادات', shortLabel: 'المزادات', subtitle: 'أراضٍ وأصول وفرص جديدة', icon: 'gavel' },
  { id: 'companies', label: 'الشركات', shortLabel: 'الشركات', subtitle: 'إدارة أعمالك وقطاعاتك', icon: 'company' },
  { id: 'investments', label: 'الاستثمارات', shortLabel: 'الاستثمار', subtitle: 'خطط لتوسّعك القادم', icon: 'investment' },
  { id: 'lands', label: 'الأراضي', shortLabel: 'الأراضي', subtitle: 'أصولك العقارية ومواقعك', icon: 'land' },
  { id: 'production', label: 'المصانع والإنتاج', shortLabel: 'الإنتاج', subtitle: 'مصانعك وسلاسل الإنتاج', icon: 'factory' },
  { id: 'inventory', label: 'المواد الخام والمخازن', shortLabel: 'المخازن', subtitle: 'المواد والمنتجات والمخزون', icon: 'warehouse' },
  { id: 'reports', label: 'التقارير المالية', shortLabel: 'التقارير', subtitle: 'صورة واضحة عن الأداء المالي', icon: 'report' },
  { id: 'tasks', label: 'المهام والإنجازات', shortLabel: 'المهام', subtitle: 'أهداف وتحديات مستقبلية', icon: 'tasks' },
  { id: 'settings', label: 'الإعدادات', shortLabel: 'الإعدادات', subtitle: 'إدارة ملفك المحلي', icon: 'settings' },
];

export function getSection(id: SectionId): SectionItem {
  return GAME_SECTIONS.find((section) => section.id === id) ?? GAME_SECTIONS[0];
}
