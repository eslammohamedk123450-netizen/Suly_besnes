import { useState, type FormEvent } from 'react';
import type { PlayerProfile } from '../domain/player';
import { redeemRewardCode } from '../game/rewards';

interface CodeRedemptionProps { profile: PlayerProfile; onRedeemed: (profile: PlayerProfile, message: string) => void }

export function CodeRedemption({ profile, onRedeemed }: CodeRedemptionProps) {
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setNotice('');
    const result = await redeemRewardCode(profile, code);
    setBusy(false); setSuccess(result.ok); setNotice(result.message);
    if (result.ok) { setCode(''); onRedeemed(result.profile, result.message); }
  }
  return <div className="code-redemption"><div><strong>كود مكافأة</strong><p>الأكواد منفصلة عن تسجيل الدخول، وموقعة لحماية قيمة المكافأة.</p></div><form className="code-redemption-form" onSubmit={submit}><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="SULY1...." aria-label="كود المكافأة" required /><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'جارٍ التحقق...' : 'استرداد الكود'}</button></form>{notice && <div className={`code-redemption-notice${success ? ' is-success' : ''}`} role="status">{notice}</div>}<small>الأكواد المستخدمة على هذا الحساب: {profile.redeemedCodeIds.length}</small></div>;
}
