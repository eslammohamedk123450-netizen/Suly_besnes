import type { IconName } from '../components/Icon';

export type SectionId =
  | 'home'
  | 'auctions'
  | 'companies'
  | 'investments'
  | 'bank'
  | 'staff'
  | 'obligations'
  | 'lands'
  | 'production'
  | 'inventory'
  | 'reports'
  | 'contracts'
  | 'tasks'
  | 'profile'
  | 'settings';

export interface SectionItem {
  id: SectionId;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: IconName;
}

export interface SectionGroup {
  id: string;
  label: string;
  sections: readonly SectionId[];
}

export const GAME_SECTIONS: readonly SectionItem[] = [
  { id: 'home', label: 'الرئيسية', shortLabel: 'الرئيسية', subtitle: 'ملخص إمبراطوريتك', icon: 'home' },
  { id: 'auctions', label: 'المزادات', shortLabel: 'المزادات', subtitle: 'أراضٍ وأصول وفرص جديدة', icon: 'gavel' },
  { id: 'companies', label: 'الشركات', shortLabel: 'الشركات', subtitle: 'إدارة أعمالك وقطاعاتك', icon: 'company' },
  { id: 'investments', label: 'الاستثمارات', shortLabel: 'الاستثمار', subtitle: 'خطط لتوسّعك القادم', icon: 'investment' },
  { id: 'bank', label: 'البنك والتمويل', shortLabel: 'البنك', subtitle: 'ودائع وقروض بضمان', icon: 'bank' },
  { id: 'staff', label: 'الإدارة والرواتب', shortLabel: 'الموظفون', subtitle: 'مديرون ومحاسبون ومحامون', icon: 'company' },
  { id: 'obligations', label: 'الالتزامات', shortLabel: 'الالتزامات', subtitle: 'ما يجب دفعه ومتى', icon: 'report' },
  { id: 'lands', label: 'الأراضي', shortLabel: 'الأراضي', subtitle: 'أصولك العقارية ومواقعك', icon: 'land' },
  { id: 'production', label: 'المصانع والإنتاج', shortLabel: 'الإنتاج', subtitle: 'مصانعك وسلاسل الإنتاج', icon: 'factory' },
  { id: 'inventory', label: 'المواد الخام والمخازن', shortLabel: 'المخازن', subtitle: 'المواد والمنتجات والمخزون', icon: 'warehouse' },
  { id: 'reports', label: 'التقارير المالية', shortLabel: 'التقارير', subtitle: 'صورة واضحة عن الأداء المالي', icon: 'report' },
  { id: 'contracts', label: 'العقود والعملاء', shortLabel: 'العقود', subtitle: 'طلبات السوق والسمعة التجارية', icon: 'briefcase' },
  { id: 'tasks', label: 'المهام والإنجازات', shortLabel: 'المهام', subtitle: 'أهداف وتحديات مستقبلية', icon: 'tasks' },
  { id: 'profile', label: 'الملف الشخصي', shortLabel: 'ملفي', subtitle: 'معرفك وتقدمك وشاراتك', icon: 'user' },
  { id: 'settings', label: 'الإعدادات', shortLabel: 'الإعدادات', subtitle: 'إدارة ملفك المحلي', icon: 'settings' },
];

export const SECTION_GROUPS: readonly SectionGroup[] = [
  { id: 'home', label: 'المركز', sections: ['home'] },
  { id: 'market', label: 'السوق والتوسع', sections: ['auctions', 'lands', 'companies'] },
  { id: 'operations', label: 'التشغيل', sections: ['production', 'inventory'] },
  { id: 'finance', label: 'المال والتقدم', sections: ['investments', 'bank', 'staff', 'obligations', 'reports', 'contracts', 'tasks'] },
  { id: 'settings', label: 'الحساب والنظام', sections: ['profile', 'settings'] },
];

export function getSection(id: SectionId): SectionItem {
  return GAME_SECTIONS.find((section) => section.id === id) ?? GAME_SECTIONS[0];
}
