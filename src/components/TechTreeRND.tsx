import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { ExpansionState } from '../game/expansionEngine';
import { unlockTechNode } from '../game/expansionEngine';
import { TECH_TREE_NODES } from '../game/expansionCatalog';
import { formatCurrency } from '../domain/formatters';
import './TechTreeRND.css';

interface Props {
  profile: PlayerProfile;
  expansion: ExpansionState;
  onUpdate: (updatedProfile: PlayerProfile, updatedExpansion: ExpansionState) => void;
}

export const TechTreeRND: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'automation' | 'logistics' | 'marketing' | 'finance'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUnlock = (techId: string) => {
    const res = unlockTechNode(profile, expansion, techId);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      onUpdate(res.updatedProfile, res.updatedExpansion);
      showToast(`🧬 تم إنجاز البحث والتطوير وتفعيل الميزة التكنولوجية!`);
    }
  };

  const researchedCount = expansion.researchedTechIds.length;
  const filteredNodes = TECH_TREE_NODES.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'automation':
        return '🤖 الأتمتة والذكاء الاصطناعي';
      case 'logistics':
        return '🚚 سلاسل الإمداد والشحن';
      case 'marketing':
        return '📢 التسويق والعلامة التجاريّة';
      case 'finance':
        return '📈 الهندسة المالية والاستثمار';
      default:
        return cat;
    }
  };

  return (
    <div className="tech-tree-container">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-sky-300 border border-sky-500/50 px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="tech-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧪</span>
              <h2 className="text-2xl font-black text-sky-300">مختبر الأبحاث والتطوير والأتمتة (R&D)</h2>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              استثمر أموالك والماس في تطوير تقنيات الأتمتة، خفض تكاليف سلاسل الإمداد، وتأمين عوائد مالية متضاعفة.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-3 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-400">التقنيات المكتملة</div>
              <div className="text-lg font-black text-emerald-400">
                {researchedCount} من {TECH_TREE_NODES.length} تقنية
              </div>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            الكل ({TECH_TREE_NODES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('automation')}
            className={`category-tab ${selectedCategory === 'automation' ? 'active' : ''}`}
          >
            🤖 الأتمتة
          </button>
          <button
            onClick={() => setSelectedCategory('logistics')}
            className={`category-tab ${selectedCategory === 'logistics' ? 'active' : ''}`}
          >
            🚚 اللوجستيات
          </button>
          <button
            onClick={() => setSelectedCategory('marketing')}
            className={`category-tab ${selectedCategory === 'marketing' ? 'active' : ''}`}
          >
            📢 التسويق
          </button>
          <button
            onClick={() => setSelectedCategory('finance')}
            className={`category-tab ${selectedCategory === 'finance' ? 'active' : ''}`}
          >
            📈 الهندسة المالية
          </button>
        </div>
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isUnlocked = expansion.researchedTechIds.includes(node.id);
          const prereqsMet = node.prerequisites.every((id) => expansion.researchedTechIds.includes(id));
          const canAfford = profile.bankBalance >= node.costMoney && profile.diamonds >= node.costDiamonds;

          return (
            <div key={node.id} className={`tech-node-card ${isUnlocked ? 'unlocked' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{node.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{node.title}</h3>
                    <span className="text-xs text-slate-400">{getCategoryLabel(node.category)}</span>
                  </div>
                </div>
                {isUnlocked ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    مكتمل ✓
                  </span>
                ) : !prereqsMet ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                    يتطلب أبحاث سابقة
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    جاهز للأبحاث
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>

              {/* Boost effect box */}
              <div className="bg-slate-900/90 border border-sky-500/20 rounded-lg p-3">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <span>🚀</span> تأثير التقنية:
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">{node.boostDescription}</div>
              </div>

              {/* Requirements & Action button */}
              <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-slate-800">
                {!isUnlocked && (
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div>
                      التكلفة: <span className="font-bold text-amber-300">{formatCurrency(node.costMoney, 'EGP')}</span>
                    </div>
                    {node.costDiamonds > 0 && (
                      <div className="font-bold text-cyan-400 flex items-center gap-1">
                        💎 {node.costDiamonds} ماسة
                      </div>
                    )}
                  </div>
                )}

                {isUnlocked ? (
                  <div className="w-full text-center py-2 bg-emerald-950/60 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/20">
                    تم تمويلها وتفعيلها في الإمبراطورية
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlock(node.id)}
                    disabled={!prereqsMet || !canAfford}
                    className="unlock-tech-btn"
                  >
                    {!prereqsMet
                      ? 'مغلق (أكمل المتطلبات)'
                      : !canAfford
                      ? 'الرصيد / الماس غير كافٍ'
                      : 'تمويل الأبحاث والتفعيل'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
