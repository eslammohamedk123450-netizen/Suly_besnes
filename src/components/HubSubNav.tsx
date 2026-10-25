import type { SectionId } from '../domain/navigation';
import { getSection } from '../domain/navigation';
import { Icon } from './Icon';

export interface HubGroup {
  id: string;
  title: string;
  sections: SectionId[];
}

export const HUB_GROUPS: HubGroup[] = [
  {
    id: 'business',
    title: '🏢 مركز الأعمال والأصول',
    sections: ['companies', 'lands', 'production', 'inventory'],
  },
  {
    id: 'market',
    title: '🔨 المركز المالي والتجاري',
    sections: ['auctions', 'investments', 'bank', 'contracts'],
  },
  {
    id: 'management',
    title: '👥 مركز الإدارة والتقدم',
    sections: ['staff', 'tasks', 'reports', 'obligations'],
  },
  {
    id: 'profile_hub',
    title: '👤 مركز الحساب والمتجر',
    sections: ['profile', 'store', 'settings'],
  },
];

interface HubSubNavProps {
  currentSection: SectionId;
  onNavigate: (sectionId: SectionId) => void;
}

export function HubSubNav({ currentSection, onNavigate }: HubSubNavProps) {
  const group = HUB_GROUPS.find((g) => g.sections.includes(currentSection));
  if (!group) return null;

  return (
    <nav className="hub-sub-nav" aria-label="التنقل بين أقسام المركز">
      <div className="hub-sub-nav-header">
        <span className="hub-sub-nav-title">{group.title}</span>
        <span className="hub-sub-nav-badge">تنسيق مبسط ⚡</span>
      </div>
      <div className="hub-sub-nav-pills" role="tablist">
        {group.sections.map((sectionId) => {
          const section = getSection(sectionId);
          const isActive = sectionId === currentSection;
          return (
            <button
              key={sectionId}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`hub-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate(sectionId)}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
