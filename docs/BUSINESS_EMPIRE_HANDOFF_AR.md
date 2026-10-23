# ملف تسليم Business Empire — النسخة المحدثة

## تعليمات البدء للحساب التالي

هذا الملف هو نقطة البداية الرسمية لمواصلة مشروع **Business Empire**. يجب على الحساب التالي تنفيذ الخطوات التالية بالترتيب:

1. قراءة هذا الملف كاملًا.
2. طلب/تفعيل اتصال **GitHub** و**Supabase** فقط إذا كان أحدهما غير متصل.
3. عدم طلب مفاتيح سرية من المستخدم داخل المحادثة.
4. فحص المستودع والمشروع قبل تعديل أي ملف.
5. تشغيل الاختبارات الحالية.
6. متابعة قسم **خطة العمل التالية** مباشرة، دون إعادة تنفيذ الإصلاحات الموجودة هنا.
7. بعد كل تغيير: اختبار، commit، ثم push إلى `main`.

صيغة افتتاح مقترحة للحساب التالي:

> قرأت ملف التسليم. سأتحقق من اتصال GitHub وSupabase، ثم أفحص آخر commit وحالة الاختبارات قبل متابعة خطة العمل مباشرة.

---

## تعريف المشروع

- اسم المشروع: `Business Empire`
- المستودع: https://github.com/eslammohamedk123450-netizen/Suly_besnes
- الفرع: `main`
- Supabase Project ref: `kamxjsddjxowodatafqo`
- Supabase URL: `https://kamxjsddjxowodatafqo.supabase.co`
- نوع المشروع: React + TypeScript + Vite + Capacitor
- لغة الواجهة: العربية
- مجلد العمل المتوقع: `/home/ubuntu/Suly_besnes`

لا تُرسل مفاتيح Supabase أو GitHub إلى المستخدم. استخدم الموصلات الرسمية. مفتاح Supabase العام الموجود في الواجهة ليس سرًا، أما `service_role` فلا يجوز وضعه في الواجهة أو GitHub.

---

## الحالة الحالية المؤكدة

آخر commit مرفوع إلى GitHub:

```text
5391b27 fix: check command receipts before execution
```

آخر commits الأمنية والوظيفية المهمة:

```text
5391b27 fix: check command receipts before execution
72c9d0a fix: pin game command engine to repository source
6b9a9fe fix: harden database security and disable full save replacement
b4bfc02 fix: allow preview host for browser smoke tests
57139e7 feat: execute authenticated game commands server-side
6cc3773 fix: route cloud saves through authenticated function
0c02538 feat: add authoritative game transaction ledger
4ffc9d8 docs: add complete business empire handoff
```

آخر تحقق كان:

```text
main...origin/main
working tree clean
```

ابدأ دائمًا بـ:

```bash
git fetch origin
git status --short --branch
git log --oneline -8
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

---

## نتيجة الاختبارات الحالية

### اختبارات المشروع

- Vitest: **8/8 ناجحة**.
- TypeScript: ناجح.
- Production build: ناجح.
- `git diff --check`: ناجح.

الأمر الكامل:

```bash
pnpm test && pnpm typecheck && pnpm build && git diff --check
```

يوجد تحذير Vite غير مانع للبناء بأن ملف JavaScript أكبر من 500KB. يمكن معالجة ذلك لاحقًا بواسطة code splitting.

### اختبار الواجهة الفعلي

تم اختبار نسخة الإنتاج عبر المتصفح بنجاح:

1. بدء اللعب كضيف.
2. إنشاء عالم جديد.
3. المرور بالمقدمة.
4. فتح لوحة الإمبراطورية.
5. شراء أرض البداية.
6. تحديث الرصيد من `1,000,000` إلى `820,000`.
7. ظهور الأرض في الأصول.
8. تأسيس الشركة الأولى.
9. تحديث الرصيد إلى `700,000`.
10. فتح المواد الخام والمخازن.

### اختبار سحابي حقيقي عبر JWT

تم إنشاء حساب اختبار مؤقت، واختبار الوظائف عبر JWT حقيقي، ثم حذف حساب الاختبار بعد انتهاء التجربة.

النتائج:

- إنشاء ملف البداية بواسطة `game-save`: نجح.
- تنفيذ شراء الأرض عبر `game-command`: نجح.
- الرصيد تغير فعليًا إلى `820,000`.
- الأرض سجلت في الحالة الخادمية.
- تكرار نفس `commandKey`: يعيد النتيجة الأصلية مع `duplicate: true` ولا يعيد تشغيل المحرك.
- إرسال `saveData` مزور إلى `game-command`: مرفوض بحالة `400`.
- استبدال ملف حساب موجود كاملًا بواسطة `game-save`: مرفوض بحالة `403`.
- طلبان متزامنان: واحد ينجح والآخر يرفض بتعارض `409 profile_write_conflict`.
- طلبات الوظائف بلا Authorization: مرفوضة بحالة `401`.

هذا هو الاختبار الأقوى المنفذ حتى الآن للمسار السحابي.

---

## الحماية المنفذة

### تنفيذ الأوامر الخادمي

العميل لا يرسل حالة اللعبة الجديدة. يرسل اسم الأمر ووسائطه فقط:

```text
client -> Edge Function game-command with JWT
Edge Function -> load current server profile
Edge Function -> execute authoritative engine
Edge Function -> commit atomically with expected updated_at
Edge Function -> return result
```

الوظيفة:

```text
supabase/functions/game-command/index.ts
```

وتستخدم محركًا مجمعًا:

```text
supabase/functions/game-command/game-engine.ts
```

مصدر المحرك مثبت على GitHub بدل رابط جلسة مؤقتة.

### منع التكرار

يتم فحص `game_command_receipts` قبل تشغيل المحرك. كل أمر يجب أن يملك `commandKey` فريدًا. عند تكرار الأمر تعاد النتيجة السابقة ولا تُخصم الأموال مرة ثانية.

### منع التعارض

يستخدم commit الخادمي:

- قفل صف اللاعب.
- مقارنة `updated_at` المتوقع.
- تسجيل Receipt فريد.
- رفض الكتابة المتسابقة بحالة تعارض.

### منع تزوير الحفظ

الوظيفة:

```text
supabase/functions/game-save/index.ts
```

تسمح بإنشاء الملف الأولي فقط. إذا كان للحساب ملف سابق، تعيد:

```text
full_profile_replacement_disabled
```

### الوظائف المنشورة

الوظائف الحالية وحالتها:

```text
season-event       ACTIVE  verify_jwt=true
finalize-seasons   ACTIVE  verify_jwt=false مع تحقق يدوي للمفتاح
 game-transaction  ACTIVE  verify_jwt=true
reward-code        ACTIVE  verify_jwt=true
game-save          ACTIVE  verify_jwt=true
game-command       ACTIVE  verify_jwt=true
```

### قاعدة البيانات وRLS

تم تطبيق migration التحصين:

```text
supabase/migrations/20261023195500_harden_database_security.sql
```

وتشمل:

- جعل Views العامة `security_invoker`.
- سياسات قراءة واضحة للمواسم والمتصدر.
- منع وصول `anon` و`authenticated` إلى جداول السجل الخادمي.
- إلغاء صلاحية تنفيذ `rls_auto_enable` العامة.
- إضافة فهارس للعلاقات.
- تحسين سياسات `game_profiles` لاستخدام `(select auth.uid())`.

المigrations الأمنية المهمة:

```text
20261023185000_create_authoritative_game_transactions.sql
20261023190000_secure_game_profile_writes.sql
20261023190500_tighten_game_profile_grants.sql
20261023191000_commit_authoritative_game_commands.sql
20261023195500_harden_database_security.sql
```

---

## تنبيه Supabase المتبقي

تم فتح لوحة Supabase والتحقق من إعداد Auth مباشرة. التنبيه المتبقي هو:

```text
Leaked Password Protection Disabled
```

في لوحة Supabase يظهر خيار:

```text
Prevent use of leaked passwords
```

لكن الخيار مقفول ويظهر أنه يتطلب **Pro plan**. لذلك لا يمكن تفعيله على الخطة المجانية الحالية، وليس بسبب نقص صلاحيات الحساب.

لا تحاول الالتفاف على هذا القيد. البدائل المجانية التي يمكن تنفيذها داخل المشروع مذكورة في خطة العمل أدناه.

---

## بنية الملفات المهمة

### الواجهة والمحرك

```text
src/App.tsx
src/game/engine.ts
src/game/selectors.ts
src/game/season.ts
src/game/season.test.ts
src/game/engine.test.ts
src/storage/remoteSaveRepository.ts
src/storage/leaderboardRepository.ts
src/domain/player.ts
src/components/SectionPage.tsx
src/components/Dashboard.tsx
```

### Supabase Edge Functions

```text
supabase/functions/game-command/index.ts
supabase/functions/game-command/game-engine.ts
supabase/functions/game-save/index.ts
supabase/functions/game-transaction/index.ts
supabase/functions/reward-code/index.ts
supabase/functions/season-event/index.ts
supabase/functions/finalize-seasons/index.ts
```

### قاعدة البيانات

```text
supabase/migrations/
supabase/tests/global_leaderboard_rls.test.sql
supabase/config.toml
```

---

## خطة العمل التالية

نفذ هذه الخطة بالترتيب، ولا تعتبر المهمة مكتملة قبل اختبار كل بند.

### 1. فحص صحة PlayerProfile على الخادم

أضف Validator خادميًا لا يقبل إلا الحالة المتوقعة، ويتحقق من:

- الرصيد ليس سالبًا.
- الذهب ليس سالبًا.
- المعرفات فريدة.
- لا توجد شركة بلا أرض.
- لا توجد منتجات بلا إنتاج صحيح.
- الطاقة والمخزون ضمن السعة.
- المستوى والنقاط ضمن الحدود.
- اليوم لا يرجع للخلف.
- لا توجد حقول ضخمة أو JSON غير متوقع.
- لا توجد أصول مكررة.

يجب تشغيل Validator قبل `commit_game_command` وبعد تنفيذ الأمر.

### 2. Rate Limiting مجاني

أضف حماية خادمية للعمليات الحساسة:

- تسجيل الدخول الفاشل.
- التسجيل.
- استرداد الأكواد.
- أوامر اللعبة.
- تغيير البريد أو كلمة المرور.

مقترح أولي:

```text
5 محاولات خلال 10 دقائق
20 محاولة خلال ساعة
```

يجب أن يكون المفتاح مركبًا من user ID أو IP أو الاثنين معًا، مع عدم تخزين كلمات المرور أو JWT.

### 3. سجل تدقيق أمني

أضف جدولًا خادميًا مثل `security_audit_events` لتسجيل:

- أوامر مرفوضة.
- محاولة `saveData`.
- تضارب الكتابة.
- تكرار الأمر.
- استرداد المكافآت.
- تغييرات الرصيد والذهب.
- محاولات RPC غير المصرح بها.

لا تسجل كلمات المرور أو Refresh Tokens أو Authorization headers.

### 4. حماية الأكواد بالكامل على الخادم

تأكد أن `reward-code`:

- يتحقق من التوقيع في الخادم.
- يحسب المكافأة من الحمولة الموقعة فقط.
- يمنع الاستخدام الثاني بقيد فريد.
- لا يستقبل `saveData` كاملًا من العميل.
- يسجل العملية في سجل تدقيق.
- يضع حدودًا للقيمة والمدة.

### 5. تقييد CORS

حاليًا توجد وظائف تستخدم CORS عامًا لأسباب تشغيلية. بعد معرفة نطاق الإنتاج، غيّر:

```text
Access-Control-Allow-Origin: *
```

إلى النطاق الرسمي فقط، مع السماح بـ localhost أثناء التطوير فقط.

لا تعتمد على CORS وحده كحماية؛ التحقق الحقيقي يبقى JWT وserver-side validation.

### 6. فصل الضيف عن المنافسة العالمية

يجب ألا يستطيع الضيف:

- دخول المتصدر العالمي.
- تسجيل نقاط موسم موثوقة.
- استلام جوائز عالمية.
- تحويل حالة LocalStorage إلى نقاط تنافسية دون تحقق.

الحساب الموثق فقط يشارك في المنافسة العالمية.

### 7. اختبارات الغش الآلية

أضف اختبارات لـ:

- رصيد سالب.
- ذهب سالب أو ضخم.
- `game_day` معدل يدويًا.
- أرض مضافة من العميل.
- منتج مضاف دون إنتاج.
- `saveData` مزور.
- `commandKey` مكرر.
- أمران متزامنان.
- JSON ضخم.
- أمر غير مسموح.
- جلسة منتهية.
- محاولة تجاوز الطاقة أو المخزون.

### 8. CSP وHeaders

في الاستضافة النهائية أضف:

```text
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
```

لا تضف CSP صارمة قبل اختبار الصور والخطوط وSupabase حتى لا تكسر الواجهة.

### 9. تفعيل إعداد Supabase عند الترقية

إذا تمت ترقية المشروع إلى Pro، فعّل من:

```text
Authentication -> Sign In / Providers -> Email
Prevent use of leaked passwords
```

ثم نفذ:

```text
Supabase Advisors security check
```

---

## قواعد مهمة للحساب التالي

1. لا تستخدم `saveData` المرسل من العميل كمصدر حقيقة.
2. لا تقبل `points` من React أو من المتصفح.
3. لا تمنح نقاطًا عالمية بناءً على LocalStorage.
4. لا تفتح RPC الخادمية للعميل.
5. لا تضع `service_role` في الواجهة.
6. لا تعتمد على Base64 أو إخفاء JavaScript أو تعطيل Developer Tools كحماية.
7. كل تغيير مالي يجب أن يمر عبر `game-command` أو وظيفة خادمية موثوقة.
8. كل عملية قابلة للتكرار يجب أن تستخدم idempotency key.
9. كل تغيير على Supabase يجب أن يكون migration محفوظًا في GitHub.
10. بعد كل تعديل: test ثم typecheck ثم build ثم diff check ثم commit وpush.

---

## معيار القبول النهائي

لا تعلن أن اللعبة جاهزة إنتاجيًا إلا بعد تحقق كل ما يلي:

```text
[ ] GitHub main متزامن ونظيف
[ ] pnpm test ناجح
[ ] pnpm typecheck ناجح
[ ] pnpm build ناجح
[ ] كل Edge Functions ACTIVE
[ ] كل الوظائف الحساسة verify_jwt=true
[ ] game-command ينفذ العمليات من الحالة الخادمية
[ ] saveData مرفوض داخل game-command
[ ] استبدال ملف موجود مرفوض داخل game-save
[ ] commandKey المكرر يعيد النتيجة السابقة
[ ] التزامن المتسابق ينتج 409 ولا يضاعف الرصيد
[ ] الحالة تمر عبر Validator خادمي
[ ] العمليات المالية لها Audit Log
[ ] Rate Limiting فعال
[ ] guest مفصول عن المتصدر العالمي
[ ] reward-code لا يقبل saveData
[ ] pgTAP/RLS tests منفذة
[ ] Supabase Advisors مفحوصة
[ ] Leaked Password Protection مفعل إن أصبحت الخطة مدفوعة
```

---

## أوامر تشغيل سريعة

```bash
cd /home/ubuntu/Suly_besnes

git fetch origin
git status --short --branch
git log --oneline -8

pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

للتطوير المحلي:

```bash
pnpm dev:hmr
```

لإنشاء APK بعد استكمال إعداد Android:

```bash
pnpm cap:apk:debug
```

---

## ملاحظة التسليم

آخر نتيجة مؤكدة قبل تسليم هذا الملف:

```text
المسار المحلي الأساسي: يعمل
المسار السحابي الأساسي مع JWT: يعمل
منع التكرار: يعمل بعد الإصلاح
منع saveData المزور: يعمل
منع التعارض المتزامن: يعمل
الاختبارات: 8/8 ناجحة
Supabase functions: ACTIVE
GitHub: متزامن
```

هذا الملف هو المرجع الأحدث. إذا تعارض مع ملف تسليم أقدم، يُعتمد هذا الملف وآخر commit في GitHub.
