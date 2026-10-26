import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';

interface RivalCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  personality: string;
  netWorth: number;
  relation: 'hostile' | 'neutral' | 'friendly';
  color: string;
  currentMessage: string;
  dialogueHistory: string[];
}

interface RivalCharactersHubProps {
  profile: PlayerProfile;
  onSendChallenge?: (rivalId: string) => void;
}

export const INITIAL_RIVALS: RivalCharacter[] = [
  {
    id: 'tarek',
    name: 'طارق الألفي',
    title: 'الأخ الأكبر ووريث إمبراطورية العائلة',
    avatar: '👔',
    personality: 'متغطرس وساخر',
    netWorth: 45000000,
    relation: 'hostile',
    color: 'from-rose-500 to-amber-600',
    currentMessage: 'تظن أنك صرت رجل أعمال بمليون أمك؟ في القصر نحن نوقّع صفقات بـ 50 مليوناً قبل شرب قهوة الصباح! لن تجرؤ على منافستي في المزادات القادمة.',
    dialogueHistory: [
      'طردك والدي لأنك ضعيف، والأسواق لا ترحم الضعفاء.',
      'سمعت أنك اشتريت قطعة أرض متواضعة.. مضحك جداً!',
    ],
  },
  {
    id: 'mamdouh',
    name: 'الحاج ممدوح الصياد',
    title: 'حوت التجارة وكبير موردي الدلتا',
    avatar: '🧔🏻‍♂️',
    personality: 'تاجر مخضرم محتكر',
    netWorth: 28000000,
    relation: 'neutral',
    color: 'from-amber-500 to-yellow-600',
    currentMessage: 'يا مرحب بابن الأكابر! سوق الأغذية والزيوت بحر غريق يا بني، إن أردت البقاء فعليك احترام الكبار، وإلا سأشتري كل خامات السوق وأترك مصانعك خاوية.',
    dialogueHistory: [
      'التجارة شطارة وليست شهادات يا بشمهندس.',
    ],
  },
  {
    id: 'laila',
    name: 'ليلى رشدي',
    title: 'مؤسسة صندوق استثمار ومشاريع التكنولوجيا',
    avatar: '👩🏻‍💼',
    personality: 'مستثمرة ذكية وشريكة محتملة',
    netWorth: 35000000,
    relation: 'friendly',
    color: 'from-teal-400 to-emerald-500',
    currentMessage: 'أراقب خطواتك في البورصة وخطوط الإنتاج.. تصميمك على النجاح بعد طردك يثير إعجابي. مكتبي في التجمع مفتوح لك في حال رغبت في جولة تمويل استثمارية شريكة.',
    dialogueHistory: [
      'السوق بحاجة لدماء شابة تكسر احتكار الحيتان القدامى.',
    ],
  },
];

export const RivalCharactersHub: React.FC<RivalCharactersHubProps> = ({
  profile,
}) => {
  const [rivals, setRivals] = useState<RivalCharacter[]>(INITIAL_RIVALS);
  const [selectedRival, setSelectedRival] = useState<RivalCharacter>(INITIAL_RIVALS[0]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  const playerNetWorth = (profile.bankBalance ?? 0) + 
    ((profile.lands?.length ?? 0) * 450000) + 
    ((profile.companies?.length ?? 0) * 600000);

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    playSound('auction');
    setReplyFeedback(`أرسلت ردك إلى ${selectedRival.name}: "سأريك في السوق قريباً!"`);
    setReplyMessage('');

    setTimeout(() => {
      setReplyFeedback(null);
    }, 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">👥</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                شخصيات السوق والمنافسون (Rival Network)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                منافسة ذكاء اصطناعي تفاعلية
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              منافسوك يراقبون تحركاتك في القاهرة والأسواق ويتحينون الفرص لمواجهتك في المزادات والصفقات
            </p>
          </div>
        </div>

        {/* Player Rank vs Rivals */}
        <div className="text-left bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">صافي ثروتك الحالية</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {formatMoney(playerNetWorth, profile.countryId)}
          </span>
        </div>
      </div>

      {/* Rivals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {rivals.map((rival) => {
          const isSelected = selectedRival.id === rival.id;
          return (
            <div
              key={rival.id}
              onClick={() => {
                playSound('click');
                setSelectedRival(rival);
              }}
              className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/95 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                  {rival.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{rival.name}</h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        rival.relation === 'hostile'
                          ? 'bg-rose-500/20 text-rose-300'
                          : rival.relation === 'friendly'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {rival.relation === 'hostile' ? 'خصم لدود' : rival.relation === 'friendly' ? 'شريكة أعمال' : 'محتكر محايد'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{rival.title}</p>
                  <p className="text-[11px] font-mono text-amber-400 font-bold mt-1">
                    الثروة: {formatMoney(rival.netWorth, profile.countryId)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Selected Rival Dialogue & Interactive Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">{selectedRival.avatar}</span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{selectedRival.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({selectedRival.personality})</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans relative">
              "{selectedRival.currentMessage}"
              <span className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900 border-t border-r border-slate-800/80 transform -rotate-45" />
            </div>
          </div>
        </div>

        {/* Quick Retort / Response Form */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800/60">
          <input
            type="text"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder={`اكتب رسالة تحدٍ لـ ${selectedRival.name}... (مثال: انتظرني في المزاد القادم!)`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSendReply}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
          >
            إرسال الرد والتحدي ⚡
          </button>
        </div>

        {replyFeedback && (
          <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center animate-fade-in">
            {replyFeedback}
          </p>
        )}
      </div>
    </div>
  );
};
