import type { IconName } from '../components/Icon';

export type SectionId =
  | 'home'
  | 'store'
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
  | 'settings'
  | 'territory'
  | 'tech_tree'
  | 'luxury'
  | 'cartel'
  | 'maritime'
  | 'megaprojects'
  | 'incubator';

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
  { id: 'territory', label: 'السيطرة الإقليمية', shortLabel: 'الخريطة', subtitle: 'خريطة السيطرة والتوسع الجغرافي', icon: 'land' },
  { id: 'tech_tree', label: 'الأبحاث والأتمتة', shortLabel: 'الأبحاث', subtitle: 'شجرة التكنولوجيا والأتمتة الذكية', icon: 'factory' },
  { id: 'luxury', label: 'الهيبة والرفاهية', shortLabel: 'الرفاهية', subtitle: 'أصول المدير التنفيذي ونقاط الهيبة', icon: 'user' },
  { id: 'cartel', label: 'الكارتيل والتحالفات', shortLabel: 'الكارتيل', subtitle: 'تكتلات تجارية وحروب أسعار وحروب تحالفات', icon: 'company' },
  { id: 'maritime', label: 'الشحن الملاحي والأسطول', shortLabel: 'الأساطيل', subtitle: 'تجارة بحرية وسلاسل إمداد دولية', icon: 'land' },
  { id: 'megaprojects', label: 'المناقصات ونفوذ الدولة', shortLabel: 'المناقصات', subtitle: 'مشاريع عملاقة ونفوذ سياسي ضريبي', icon: 'gavel' },
  { id: 'incubator', label: 'حاضنات الأعمال والـ VC', shortLabel: 'الـ VC', subtitle: 'استثمار جريء في الشركات الناشئة Unicorns', icon: 'investment' },
  { id: 'store', label: 'متجر المشتريات', shortLabel: 'المتجر', subtitle: 'الماس والبطاقات والعروض', icon: 'store' },
  { id: 'auctions', label: 'المزادات', shortLabel: 'المزادات', subtitle: 'أراضٍ وأصول وفرص جديدة', icon: 'gavel' },
  { id: 'companies', label: 'الشركات', shortLabel: 'الشركات', subtitle: 'إدارة أعمالك وقطاعاتك', icon: 'company' },
  { id: 'investments', label: 'الاستثمارات والبورصة', shortLabel: 'الاستثمار', subtitle: 'أسواق المال والطرح العام IPO', icon: 'investment' },
  { id: 'bank', label: 'البنك والتمويل', shortLabel: 'البنك', subtitle: 'ودائع وقروض بضمان', icon: 'bank' },
  { id: 'staff', label: 'الإدارة والرواتب', shortLabel: 'الموظفون', subtitle: 'مديرون ومحاسبون ومحامون', icon: 'users' },
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
  { id: 'home_group', label: 'الرئيسية والتوسع الإمبراطوري', sections: ['home', 'territory', 'tech_tree', 'luxury', 'cartel', 'maritime', 'megaprojects', 'incubator'] },
  { id: 'business_group', label: 'الأعمال والأصول', sections: ['companies', 'lands', 'production', 'inventory'] },
  { id: 'market_group', label: 'السوق والمالية والبورصة', sections: ['auctions', 'investments', 'bank', 'contracts'] },
  { id: 'management_group', label: 'الإدارة والتقدم', sections: ['staff', 'tasks', 'reports', 'obligations'] },
  { id: 'profile_group', label: 'الحساب والنظام', sections: ['profile', 'store', 'settings'] },
];

export function getSection(id: SectionId): SectionItem {
  return GAME_SECTIONS.find((section) => section.id === id) ?? GAME_SECTIONS[0];
}
