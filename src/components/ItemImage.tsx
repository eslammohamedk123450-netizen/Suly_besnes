import type { ReactNode } from 'react';

export type ItemImageType =
  | 'land'
  | 'industry'
  | 'company'
  | 'material'
  | 'product'
  | 'investment'
  | 'auction'
  | 'contract';

interface ItemImageProps {
  type: ItemImageType;
  id?: string;
  name?: string;
  landType?: 'industrial' | 'agricultural' | 'commercial';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const LAND_THEMES = {
  industrial: {
    bg: 'linear-gradient(135deg, #2b3240 0%, #151a24 100%)',
    border: 'rgba(255, 180, 50, 0.4)',
    accent: '#f59e0b',
    icon: '🏗️',
    label: 'منطقة صناعية',
    badge: 'ترخيص صناعي',
  },
  agricultural: {
    bg: 'linear-gradient(135deg, #1c3d27 0%, #0d2114 100%)',
    border: 'rgba(34, 197, 94, 0.4)',
    accent: '#22c55e',
    icon: '🌾',
    label: 'أرض زراعية',
    badge: 'خصوبة عالية',
  },
  commercial: {
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #0c1a2c 100%)',
    border: 'rgba(59, 130, 246, 0.4)',
    accent: '#3b82f6',
    icon: '🏢',
    label: 'موقع تجاري',
    badge: 'وسط العاصمة',
  },
};

const INDUSTRY_VISUALS: Record<string, { icon: string; bg: string; badge: string }> = {
  petroleum: { icon: '🛢️', bg: 'linear-gradient(135deg, #3d2218, #1a0c07)', badge: 'تكرير واستخراج' },
  electricity: { icon: '⚡', bg: 'linear-gradient(135deg, #3b3112, #1a1505)', badge: 'طاقة ومحطات' },
  gas: { icon: '🔥', bg: 'linear-gradient(135deg, #381f2f, #180a13)', badge: 'غاز طبيعي' },
  water: { icon: '💧', bg: 'linear-gradient(135deg, #133447, #071621)', badge: 'تحلية وتنقية' },
  detergents: { icon: '🧪', bg: 'linear-gradient(135deg, #2b1f3d, #120b1c)', badge: 'صناعة كيميائية' },
  food: { icon: '🍊', bg: 'linear-gradient(135deg, #3d2c16, #1c1308)', badge: 'صناعة غذائية' },
  construction: { icon: '🧱', bg: 'linear-gradient(135deg, #33251c, #170e09)', badge: 'مواد بناء' },
  electronics: { icon: '💻', bg: 'linear-gradient(135deg, #183333, #091717)', badge: 'تكنولوجيا' },
  transport: { icon: '🚚', bg: 'linear-gradient(135deg, #1e283d, #0b101c)', badge: 'لوجستيات' },
};

const MATERIAL_VISUALS: Record<string, { icon: string; color: string }> = {
  'crude-oil': { icon: '🛢️', color: '#f59e0b' },
  'natural-gas': { icon: '🔥', color: '#ef4444' },
  'water': { icon: '💧', color: '#3b82f6' },
  'chemicals': { icon: '🧪', color: '#a855f7' },
  'grain': { icon: '🌾', color: '#eab308' },
  'steel': { icon: '⚙️', color: '#94a3b8' },
  'cement': { icon: '🧱', color: '#78716c' },
  'silicon': { icon: '🎛️', color: '#14b8a6' },
  'fuel': { icon: '⛽', color: '#f97316' },
  'components': { icon: '🔧', color: '#6366f1' },
  'packaging': { icon: '📦', color: '#84cc16' },
};

export function ItemImage({ type, id = '', name = '', landType = 'industrial', size = 'md', className = '' }: ItemImageProps) {
  if (type === 'land') {
    const theme = LAND_THEMES[landType] ?? LAND_THEMES.industrial;
    return (
      <div
        className={`item-image item-image--land item-image--${size} ${className}`}
        style={{
          background: theme.bg,
          borderColor: theme.border,
        }}
      >
        <div className="item-image-overlay" />
        <span className="item-image-badge" style={{ color: theme.accent, borderColor: theme.border }}>
          {theme.badge}
        </span>
        <div className="item-image-center">
          <span className="item-image-main-icon">{theme.icon}</span>
          <span className="item-image-label">{name || theme.label}</span>
        </div>
      </div>
    );
  }

  if (type === 'industry' || type === 'company') {
    const visual = INDUSTRY_VISUALS[id] ?? { icon: '🏢', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', badge: 'شركة مسجلة' };
    return (
      <div
        className={`item-image item-image--company item-image--${size} ${className}`}
        style={{ background: visual.bg }}
      >
        <div className="item-image-overlay" />
        <span className="item-image-badge">{visual.badge}</span>
        <div className="item-image-center">
          <span className="item-image-main-icon">{visual.icon}</span>
          <span className="item-image-label">{name || 'مؤسسة إمبراطورية'}</span>
        </div>
      </div>
    );
  }

  if (type === 'material' || type === 'product') {
    const visual = MATERIAL_VISUALS[id] ?? { icon: type === 'product' ? '📦' : '💎', color: '#16c79a' };
    return (
      <div className={`item-image item-image--material item-image--${size} ${className}`}>
        <div className="item-image-overlay" />
        <div className="item-image-center">
          <span className="item-image-main-icon">{visual.icon}</span>
          <span className="item-image-label" style={{ color: visual.color }}>
            {name}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'auction') {
    return (
      <div className={`item-image item-image--auction item-image--${size} ${className}`}>
        <div className="item-image-overlay" />
        <span className="item-image-badge">🔨 مزاد فرصة</span>
        <div className="item-image-center">
          <span className="item-image-main-icon">🏛️</span>
          <span className="item-image-label">{name || 'أصل متاح للمزايدة'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`item-image item-image--default item-image--${size} ${className}`}>
      <span className="item-image-main-icon">💼</span>
      <span className="item-image-label">{name}</span>
    </div>
  );
}
