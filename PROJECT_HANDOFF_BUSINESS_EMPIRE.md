# ملف تسليم مشروع Business Empire

## الغرض من هذا الملف

هذا الملف هو نقطة البداية للحساب التالي الذي سيكمل تطوير مشروع **Business Empire**. يجب قراءة الملف كاملًا قبل تعديل الكود أو قاعدة البيانات.

المطلوب من الحساب التالي هو طلب اتصال المستخدم بـ **GitHub** و**Supabase** إذا لم يكن الاتصالان متاحين في الجلسة، ثم فحص الحالة الحالية والبدء مباشرة من قسم «خطة التنفيذ التالية» دون إعادة بناء ما تم إنجازه.

---

## تعريف المشروع

- اسم المستودع: `Suly_besnes`
- مستودع GitHub: `https://github.com/eslammohamedk123450-netizen/Suly_besnes`
- الفرع الرئيسي: `main`
- مشروع Supabase:
  - Project ref: `kamxjsddjxowodatafqo`
  - رابط API: `https://kamxjsddjxowodatafqo.supabase.co`
- لغة الواجهة: العربية.
- نوع المشروع: لعبة محاكاة إدارة إمبراطورية أعمال مبنية بـ React وTypeScript وVite.
- مجلد العمل المتوقع: `/home/ubuntu/Suly_besnes`

لا تطلب من المستخدم إرسال مفاتيح سرية داخل المحادثة. استخدم موصل GitHub وموصل Supabase الرسميين. إذا كانت أداة Supabase المتصلة تدعم نشر Edge Functions، استخدمها بدل طلب Access Token يدوي.

---

## الحالة الحالية في GitHub

آخر commit مرفوع إلى `main`:

```text
9de7b2e chore: schedule automatic season finalization
```

وتاريخ آخر commits المهمة:

```text
9de7b2e chore: schedule automatic season finalization
85a9730 feat: deploy season finalization worker
4eb147e feat: show leaderboard and claim daily login
9447a1d feat: secure season event edge function
d06cc68 feat: add secure global leaderboard foundation
8db7ad9 feat: add local empire asset map
ccb3c78 feat: add synergies previews and contract negotiation
8aa5a6c test: cover economy and improve season alerts
```

يجب البدء دائمًا بـ:

```bash
git fetch origin
git status --short --branch
git log --oneline -8
```

لا تنشئ فرعًا جديدًا إلا إذا كان ذلك مطلوبًا. العمل الحالي على `main`، والفرع كان نظيفًا ومتزامنًا في آخر تحقق.

---

## ما تم تنفيذه داخل اللعبة

### الاقتصاد والمحرك

تم تحسين واختبار منطق الاقتصاد، ومنه:

- منع قبول العقد أو تسليمه أكثر من مرة.
- احتساب الرواتب مرة واحدة لكل يوم.
- تسجيل الرواتب كالتزام مستحق بدل خصمها تلقائيًا بطريقة غير واضحة.
- إيقاف الطاقة عند وجود التزامات غير مسددة.
- استعادة الطاقة بعد سداد الالتزامات.
- منع بدء إنتاج يتجاوز سعة تخزين المنتجات.
- الحفاظ على ملفات الحفظ القديمة عند الترقية.
- اختبار رفض الحفظ السحابي غير الصالح.

الاختبارات الرئيسية:

```text
src/game/engine.test.ts
src/game/season.test.ts
```

### الموسم والتحديات

تم إصلاح منطق الموسم حتى لا تدخل الأنشطة القديمة في الموسم الجديد:

- التحديات اليومية تعتمد على اليوم الحالي.
- التحديات الأسبوعية تعتمد على النشاط داخل الموسم.
- شراء أو إنتاج أو بيع قديم لا يُحتسب تلقائيًا للموسم الحالي.
- دعم الحفظ القديم دون كسره.

### التنبيهات

تم إنشاء مركز تنبيهات دائم:

```text
src/game/notifications.ts
src/components/NotificationCenter.tsx
```

يعرض التنبيهات المشتقة من حالة اللعبة، مثل:

- رواتب متأخرة.
- التزامات مستحقة.
- اكتمال الإنتاج.
- أقساط قريبة.
- عقود تقترب من الموعد النهائي.
- تغيرات اقتصادية.
- فرص مزادات.

### التآزر الاقتصادي

تم إنشاء:

```text
src/game/synergy.ts
```

التآزر يؤثر فعليًا في اللعبة، وليس مجرد نص واجهة. الأنظمة الحالية:

- الغذاء مع النقل: خفض تكلفة وتشجيع كفاءة الإنتاج.
- النقل مع خطوط الإنتاج: خفض مصروفات اللوجستيات.
- المخزن المشترك عند تعدد الشركات ووجود مخزون.

يظهر التآزر في لوحة البداية، وتدخل مكافآته في حساب تكلفة التشغيل والإنتاج.

### معاينات القرار

تمت إضافة معاينات قبل تنفيذ القرارات:

- العقود: الإيراد، تكلفة المخزون التقديرية، والسيولة بعد التسليم.
- الإنتاج: الكمية المتوقعة، التكلفة، الإيراد، الطلب، الجودة، والسيولة بعد الحجز.
- القروض: مبلغ الاستلام، إجمالي السداد، القسط التقريبي، والسيولة بعد الصرف.

### التفاوض على العقود

أصبحت العقود قابلة لتفاوض واحد فقط لكل عقد:

- رفع السعر بنسبة 8%.
- تمديد الموعد يومًا مقابل خفض العلاوة.
- تخفيض الجودة المطلوبة مقابل خفض العلاوة.

لا يمكن إعادة التفاوض بعد استخدام الخيار الأول.

### خريطة الأصول

تمت إضافة خريطة محلية تعرض:

- الأراضي المملوكة.
- الشركات المرتبطة بالأراضي.
- الأراضي المتاحة للتأسيس.

الملف الأساسي للواجهة:

```text
src/components/Dashboard.tsx
```

---

## المتصدر العالمي: ما تم تنفيذه

### الجداول

تم تطبيق migrations على Supabase لإنشاء:

```text
public.game_seasons
public.season_scores
public.season_score_events
```

الجداول الأساسية مفعّل عليها RLS، ولا تمنح `anon` أو `authenticated` صلاحيات مباشرة للكتابة.

### views العامة

تم إنشاء views آمنة للقراءة:

```text
public.visible_game_seasons
public.global_leaderboard
```

العميل يحصل على `SELECT` فقط من هذه views، ولا يحصل على صلاحيات تعديل أو حذف أو إدخال.

### RPC القراءة

تم إنشاء:

```text
public.get_global_leaderboard(p_season_id, p_limit, p_offset)
```

وهي دالة قراءة لا تعيد البريد الإلكتروني أو `user_id`.

### RPC تسجيل النقاط

تم إنشاء:

```text
public.record_season_event(...)
```

لكنها مقفلة على `service_role` فقط.

الوضع الأمني المتحقق منه:

```text
anon_can_write = false
authenticated_can_write = false
service_role_can_write = true
```

لا تفتح هذه الدالة للمتصفح ما لم يتم إنشاء تحقق server-side موثوق.

### Edge Function تسجيل الدخول

تم نشر الوظيفة التالية على Supabase:

```text
season-event
```

حالتها:

```text
ACTIVE
verify_jwt = true
```

مسارها المحلي:

```text
supabase/functions/season-event/index.ts
```

وظيفتها:

1. التحقق من JWT المستخدم.
2. قبول `login_reward` فقط.
3. إنشاء مفتاح يومي بالشكل:

```text
login:<user-id>:<yyyy-mm-dd>
```

4. استدعاء RPC الخادمي بمفتاح `service_role`.
5. منع احتساب مكافأة الدخول أكثر من مرة في اليوم بفضل القيد الفريد.

### Edge Function إغلاق المواسم

تم نشر:

```text
finalize-seasons
```

حالتها:

```text
ACTIVE
verify_jwt = false
```

لكنها تتحقق يدويًا من `apikey` أو Bearer service key قبل تنفيذ أي شيء.

مسارها المحلي:

```text
supabase/functions/finalize-seasons/index.ts
```

### الإغلاق التلقائي

تم إنشاء:

```text
public.finalize_expired_seasons()
```

وتشغيلها عبر `pg_cron` كل 15 دقيقة:

```text
job name: finalize-expired-seasons
schedule: */15 * * * *
command: select public.finalize_expired_seasons();
active: true
```

أي موسم نشط انتهى `ends_at` يتحول إلى `finalized`.

### واجهة المتصدر

تمت إضافة بطاقة المتصدر إلى لوحة البداية:

```text
src/components/GlobalLeaderboardCard.tsx
```

وتقرأ عبر:

```text
src/storage/leaderboardRepository.ts
```

الدوال الحالية:

```ts
getVisibleSeasons()
getGlobalLeaderboard(seasonId, limit, offset)
claimDailySeasonLogin(seasonId)
```

### ربط تسجيل الدخول

تم ربط مكافأة الدخول اليومية بمسار الحساب السحابي في:

```text
src/App.tsx
```

الفشل في المتصدر لا يمنع المستخدم من دخول اللعبة أو متابعة الحفظ المحلي.

---

## ملفات Supabase المهمة

```text
supabase/config.toml
supabase/migrations/20261023180000_create_global_leaderboard.sql
supabase/migrations/20261023180500_restrict_leaderboard_view_grants.sql
supabase/migrations/20261023181000_lock_score_ingestion_to_server.sql
supabase/migrations/20261023182000_secure_season_event_ingestion.sql
supabase/migrations/20261023183000_finalize_expired_seasons.sql
supabase/migrations/20261023184000_schedule_season_finalization.sql
supabase/tests/global_leaderboard_rls.test.sql
supabase/functions/season-event/index.ts
supabase/functions/finalize-seasons/index.ts
```

ملف إعداد الوظائف:

```toml
[functions.season-event]
verify_jwt = true

[functions.finalize-seasons]
verify_jwt = false
```

---

## ما تبقى من العمل

### الأولوية 1: إضافة نقاط لعب موثوقة

حاليًا النقاط العالمية الفعلية تدعم مكافأة الدخول اليومية فقط.

لا تضف نقاطًا عالمية مباشرة من React أو من `save_data`. الحفظ الحالي يمكن أن يعدله العميل، ولذلك لا يصلح دليلًا موثوقًا.

يجب إنشاء طبقة معاملات server-side للأحداث المهمة، مثل:

- إكمال الإنتاج.
- البيع.
- تسليم العقد.
- الفوز في المزاد.
- إكمال التحديات.

النهج المقترح:

1. إنشاء جداول معاملات لا يملك العميل صلاحية تعديلها.
2. تنفيذ العملية من خلال RPC أو Edge Function.
3. التحقق من الرصيد والمخزون والطاقة والملكية داخل الخادم.
4. تسجيل المعاملة مع `idempotency_key` فريد.
5. بعد نجاح المعاملة فقط، تسجيل نقاط الموسم.
6. عدم قبول `points` من العميل.

مثال للمعاملة الصحيحة:

```text
client request -> Edge Function with JWT
Edge Function -> validate current server-side state
Edge Function -> insert authoritative transaction
Edge Function -> record verified season event
Edge Function -> return result
```

### الأولوية 2: أحداث موسم موثوقة

بعد وجود معاملات خادمية، أضف أنواع أحداث مثل:

```text
daily_market
 daily_auction
weekly_builder
weekly_operator
weekly_investor
production_completed
contract_delivered
auction_won
```

لكل حدث يجب وجود تحقق مستقل. لا يكفي تغيير `event_type` أو إرسال `source_id` من المتصفح.

### الأولوية 3: موسم جديد تلقائيًا

الإغلاق التلقائي موجود، لكن لا يتم إنشاء موسم جديد تلقائيًا.

أضف داخل وظيفة خادمية أو migration مدروسة:

- إنشاء الموسم التالي بعد إغلاق الموسم السابق.
- عدم إنشاء موسم مكرر باستخدام `season_key unique`.
- تحديد مدة الموسم بوضوح.
- إبقاء الموسم السابق `finalized` للقراءة.

### الأولوية 4: صفحة متصدر كاملة

البطاقة الحالية تعرض أفضل خمسة فقط. المطلوب لاحقًا:

- صفحة مستقلة للمتصدر.
- Pagination حتى 100 صف في الصفحة.
- عرض ترتيب المستخدم الحالي حتى لو كان خارج أفضل خمسة.
- عرض تاريخ المواسم النهائية.
- إخفاء البريد الإلكتروني و`user_id` دائمًا.
- عرض الشارات والنتيجة وعدد التحديات الموثقة.

### الأولوية 5: تشغيل اختبارات pgTAP

ملف الاختبارات:

```text
supabase/tests/global_leaderboard_rls.test.sql
```

يجب تشغيله بواسطة Supabase CLI أو أداة بيئة موثوقة. الاختبارات تتحقق من:

- RLS مفعّل.
- عدم وجود صلاحيات كتابة للعميل.
- وجود صلاحية القراءة على views.
- صلاحية RPC للخادم فقط.
- عدم تسريب الجداول الأساسية.

### الأولوية 6: مراقبة Edge Functions

أضف مراقبة وفحوصات لـ:

- أخطاء `season-event`.
- أخطاء `finalize-seasons`.
- تكرار الطلبات.
- عدد الأحداث المرفوضة.
- محاولات استدعاء RPC غير المصرح بها.

استخدم Supabase logs وAdvisors بعد كل migration أمني.

### الأولوية 7: تحسينات اللعبة

بعد إغلاق مسار النقاط الموثوقة، يمكن إضافة:

- منافسين آليين دائمين باستراتيجيات مختلفة.
- أحداث اقتصادية قصصية أكثر.
- جوائز موسمية وشارات.
- تحالفات أو منافسة بين اللاعبين.
- صفحة تاريخ الموسم.
- ترتيب الأصدقاء.
- إشعار مزامنة واضح عند فشل الحفظ.
- تقسيم JavaScript إلى chunks أصغر، لأن Vite يعرض تحذيرًا أن الحزمة الرئيسية أكبر من 500KB.

---

## قواعد أمنية إلزامية للحساب التالي

لا تفعل الآتي:

- لا تمنح العميل صلاحية `insert/update/delete` على `season_scores`.
- لا تمنح العميل صلاحية `insert/update/delete` على `season_score_events`.
- لا تقبل قيمة `points` من الواجهة.
- لا تثق في `save_data` كدليل عالمي دون تحقق خادمي.
- لا تضع `service_role` key في React أو GitHub أو ملفات عامة.
- لا تستخدم `security definer` دون `set search_path = ''`.
- لا تنشئ view عامة تعرض `user_id` أو البريد الإلكتروني بلا حاجة.
- لا تغير migration مطبقة؛ أنشئ migration جديدة.
- لا تعيد تشغيل عملية مالية أو مكافأة بدون idempotency key.

---

## أوامر التحقق الأساسية

من مجلد المشروع:

```bash
pnpm test
pnpm typecheck
pnpm build
git diff --check
git status --short --branch
```

النتيجة المتوقعة حاليًا:

```text
8 tests passed
pnpm typecheck: success
pnpm build: success
```

ملاحظة: يوجد تحذير Vite عن حجم chunk الرئيسي، لكنه ليس فشلًا في البناء.

---

## خطوات البدء للحساب التالي

1. اطلب من المستخدم تمكين موصل GitHub وموصل Supabase إذا لم يكونا متصلين.
2. استنسخ أو افتح المستودع:

```bash
gh repo clone eslammohamedk123450-netizen/Suly_besnes
cd Suly_besnes
```

3. تحقق من الفرع والـ commits.
4. استكشف مشروع Supabase بالـ project ref:

```text
kamxjsddjxowodatafqo
```

5. تحقق من:
   - migrations.
   - الجداول الثلاثة.
   - views.
   - RPCs.
   - Edge Functions.
   - pg_cron job.
6. لا تعيد تنفيذ migrations القديمة.
7. ابدأ من «الأولوية 1: إضافة نقاط لعب موثوقة».
8. بعد كل تعديل:
   - طبّق migration عبر أداة Supabase الرسمية.
   - شغّل الاختبارات.
   - شغّل `typecheck` و`build`.
   - ارفع commit واضحًا إلى `main`.

---

## معيار اكتمال المشروع النهائي

يُعتبر مشروع المتصدر العالمي مكتملًا عندما تتحقق كل النقاط التالية:

- المستخدم يرى المتصدر العالمي والنتيجة الحالية.
- المستخدم يحصل على مكافأة الدخول اليومية مرة واحدة فقط.
- الإنتاج والمبيعات والعقود والمزادات تسجل معاملات خادمية موثوقة.
- النقاط تُحسب من معاملات موثوقة لا من الحفظ المحلي.
- لا يستطيع العميل تعديل نقاطه أو نقاط غيره.
- الموسم يُغلق تلقائيًا.
- الموسم التالي يُنشأ تلقائيًا أو تتم إدارته بوضوح.
- اختبارات RLS وpgTAP ناجحة.
- Edge Functions منشورة ومراقبة.
- لا توجد أسرار في GitHub أو ملفات الواجهة.
- جميع الاختبارات والبناء ناجحة.

---

## الخلاصة التي يجب أن يعرفها الحساب التالي

الجزء الأساسي من اللعبة موجود ويعمل. المتصدر العالمي، RLS، Edge Functions، الواجهة، مكافأة الدخول، وإغلاق المواسم تم تنفيذها ورفعها. العمل الأهم المتبقي ليس إنشاء واجهة جديدة، بل نقل العمليات الاقتصادية الحساسة إلى معاملات خادمية موثوقة حتى يمكن منح نقاط الإنتاج والمبيعات والعقود والمزادات دون قابلية للتلاعب.
