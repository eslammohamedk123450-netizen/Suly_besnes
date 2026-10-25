# ملاحظات التكامل والأمان

## نتائج فحص المشروع الحي

تم التحقق للقراءة فقط من مشروع Supabase النشط `kamxjsddjxowodatafqo` في 2026-10-23. جدول `public.game_profiles` يحتوي الأعمدة `user_id`, `player_name`, `game_day`, `save_data`, `updated_at`؛ ولا يوجد به حاليًا عمود `account_code`. تضم قاعدة البيانات خمسة ملفات لاعب. لم يظهر دالة `admin_grant_account` ولا مشغل على `game_profiles`. دوال `replace_game_profile` و`commit_game_command` و`redeem_reward_code` موجودة ومقيدة بالتنفيذ إلى `service_role`.

ملفات اللاعب لا تحتوي حاليًا على `save_data.accountCode`. لكن التطبيق عند إنشاء عالم لحساب غير ضيف يستدعي `normalizeAccountFeatures(..., account?.id)`؛ لذا يكون seed الفعلي لمعرف BE هو UUID حساب Supabase، وليس `save_data.id` أو معرّف العالم. العمود الإداري `account_code` يجب أن يُشتق من `game_profiles.user_id::text` حتى يطابق المعرّف الذي تعرضه اللعبة.

تطبّق `accountCodeFromSeed(seed)` hash ثابتًا على `seed`، ثم hash ثانيًا على `seed + ':business-empire'`، وتحول القيمتين إلى base36 بالأطوال 7 و5؛ الصيغة `BE-XXXXXXX-XXXXX`. عند إنشاء عالم لحساب متصل، `seed` هو `account?.id`؛ ويُستخدم `profile.id` فقط عند عدم تمرير seed. المصدر: `Suly_besnes/src/domain/accountFeatures.ts` و`Suly_besnes/src/App.tsx`.

## توافق أكواد المكافآت

صيغة الكود التي يتحقق منها التطبيق هي `SULY1.<payload-base64url>.<signature-base64url>`. التوقيع Ed25519 على نص مقطع الحمولة المشفر base64url، مع حمولة إصدار 1 تتضمن `codeId`, `issuedAt`, `expiresAt`, و`rewards`. مفتاح التحقق العام الحالي موجود في `Suly_besnes/src/game/rewards.ts`، ولا ينبغي تغيير المفتاح أو صيغة الحمولة أثناء إعادة بناء المولد. المفتاح الخاص لم يظهر في المستودع المتاح.

ملاحظة أمان للمراجعة قبل توسيع الأكواد: مسار `reward-code` الحالي يستقبل `saveData` من العميل ويطلب من RPC تخزينها؛ لم يظهر تحقق التوقيع على الخادم. لذلك لا تفترض أن التحقق الموجود في واجهة اللعبة وحده يحمي الأرصدة. أي إصلاح لهذا المسار يجب أن يعيد احتساب المكافأة على الخادم من الحالة المحفوظة وألا يثق بملف يرسله العميل.

## ضوابط Supabase المعتمدة

لا يُرسل مفتاح `service_role` إلى المتصفح. تُنشأ الجداول الجديدة مع RLS مفعّلًا، وتُمنح صلاحية التنفيذ إلى الخادم الموثوق فقط. يجب أن تكون الدوال الحساسة محددة بـ `SECURITY DEFINER` و`SET search_path = ''` عند الحاجة، مع أسماء مؤهلة بالكامل وسحب `EXECUTE` من `public`, `anon`, و`authenticated`.

المراجع الرسمية:
- [Supabase Postgres Roles](https://supabase.com/docs/guides/database/postgres/roles)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)

## تصحيحات التوافق بعد المراجعة

- صيغة BE تستخدم آخر خمسة أحرف من المقطع الثاني مثل JavaScript `.slice(-5)`. لا يصلح `right(lpad(...))` وحده لأن PostgreSQL قد يقتطع النص الطويل داخل `lpad` أولًا؛ استُخدم `right(repeat('0', width) || value, width)`، واختُبر UUID اصطناعي فطابق كود اللعبة.
- خصم الذهب إداريًا يقرّب قيمة الأساس الدفتري المحذوف إلى عدد صحيح مثل `sellGold` في اللعبة.
- وظيفة Supabase `reward-code` الحالية تسترد الأكواد ولا تصدرها؛ يظل المولد مقفولًا إلى أن يُستعاد مفتاح التوقيع الخاص الأصلي.
