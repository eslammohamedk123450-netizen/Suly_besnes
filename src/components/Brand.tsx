import { Icon } from './Icon';

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
      <span className="brand-crown" aria-hidden="true"><Icon name="crown" size={22} /></span>
      <span className="brand-copy">
        <strong>إمبراطورية الأعمال</strong>
        <span>BUSINESS EMPIRE</span>
      </span>
    </div>
  );
}
