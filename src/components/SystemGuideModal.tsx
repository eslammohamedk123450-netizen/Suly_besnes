import { useRef } from 'react';
import type { SectionId } from '../domain/navigation';
import { getSystemGuide } from '../game/onboarding';
import { Icon } from './Icon';
import { useDialogA11y } from './useDialogA11y';

interface SystemGuideModalProps {
  section: SectionId;
  onClose: () => void;
}

export function SystemGuideModal({ section, onClose }: SystemGuideModalProps) {
  const guide = getSystemGuide(section);
  const dialogRef = useRef<HTMLElement | null>(null);
  useDialogA11y(dialogRef, onClose);

  return <div className="guide-backdrop" role="presentation">
    <section ref={dialogRef} className="system-guide" role="dialog" aria-modal="true" aria-labelledby="system-guide-title" tabIndex={-1}>
      <div className="system-guide-icon"><Icon name="target" size={25} /></div>
      <span className="section-kicker">نظام جديد متاح</span>
      <h2 id="system-guide-title">{guide.title}</h2>
      <p>{guide.description}</p>
      <div className="system-guide-steps">{guide.steps.map((step, index) => <div className="system-guide-step" key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}</div>
      <button className="button button-primary" type="button" onClick={onClose}>فهمت، ابدأ النظام <Icon name="arrow" size={17} /></button>
    </section>
  </div>;
}
