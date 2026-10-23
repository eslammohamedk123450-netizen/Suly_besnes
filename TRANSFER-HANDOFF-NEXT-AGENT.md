# ملف تسليم مشروع Business Empire

**المشروع:** Business Empire / Suly_besnes  
**المستودع:** https://github.com/eslammohamedk123450-netizen/Suly_besnes  
**الفرع:** `main`  
**تاريخ التسليم:** 2026-10-23  
**لغة الواجهة:** العربية  
**المسار الحالي في البيئة:** `/home/ubuntu/Suly_besnes`

---

## 1. الحالة الحالية

آخر نسخة مرفوعة إلى GitHub هي:

```text
44802d1 feat: enable production speed cards
```

آخر Commit مرفوعة إلى `origin/main` وتحتوي على:

```text
0ae766e feat: add admin account grants by public id
b3ce501 feat: add account ids and admin-managed rewards foundation
2f28736 fix: account for contract quality and sale costs
3b62adb fix: align onboarding, guest saves, and accessible navigation
79c815c feat: guide first land purchase and refresh app icon
```

حالة Git بعد رفع ملف التسليم:

```text
## main...origin/main
```

تم رفع بداية حاسبة **نقاط الإمبراطورية** داخل `src/game/selectors.ts` في Commit WIP أعلاه. المتبقي هو إضافة واجهتها واختبارها؛ لا تعتبر الميزة مكتملة قبل تنفيذ ذلك.

---

## 2. ما تم إنجازه فعليًا

### الحسابات ومعرّف الحساب

تمت إضافة معرّف عام ثابت لكل حساب بصيغة:

```text
BE-XXXXXXX-XXXXX
```

المعرّف لا يحتوي البريد الإلكتروني، ويظهر للاعب داخل صفحة الإعدادات. يمكن للاعب إرساله عبر واتساب للمشرف بدل إرسال كلمة المرور أو أي بيانات حساسة.

الملفات المهمة:

```text
src/domain/accountFeatures.ts
src/domain/player.ts
src/App.tsx
src/components/SectionPage.tsx
src/storage/saveRepository.ts
src/storage/remoteSaveRepository.ts
```

### الماس والبطاقات والشارات

تمت إضافة الحقول التالية إلى ملف اللاعب:

```ts
accountCode: string
diamonds: number
speedCards: SpeedCardStack[]
badges: string[]
```

تتم تهيئة هذه الحقول تلقائيًا للحسابات القديمة دون فقدان التقدم السابق.

### بطاقات تسريع الإنتاج

تم تنفيذ بطاقات:

```text
production-25       تسريع الإنتاج 25%
production-50       تسريع الإنتاج 50%
production-instant  إكمال الإنتاج فورًا
capacity-boost      محجوزة لاستخدام مستقبلي في ترقية السعة
```

يوجد منطق فعلي لاستهلاك البطاقة وتعديل موعد اكتمال أمر الإنتاج داخل:

```text
src/game/engine.ts
```

وتظهر أزرار البطاقات بجانب أوامر الإنتاج النشطة داخل:

```text
src/components/SectionPage.tsx
```

### لوحة الإدارة

تمت إضافة مسارات API في `vite.config.ts`:

```text
/api/admin/account-lookup
/api/admin/account-grant
```

وتم تحديث لوحة الإدارة في:

```text
src/AdminApp.tsx
```

يمكن للمشرف البحث بمعرّف الحساب ومنح:

- مال.
- ذهب بالجرام.
- ماس.
- شارة.
- بطاقات تسريع.

### سجل التدقيق الإداري

تمت إضافة مخطط Supabase في:

```text
docs/supabase-schema.sql
```

ويتضمن:

- `game_profiles.account_code`
- فهرسًا فريدًا لمعرّف الحساب.
- جدول `admin_grant_audit`.
- دالة `admin_grant_account(...)` للمنح الذرية من الخادم.

### أكواد المكافآت

النظام السابق لأكواد المكافآت الموقعة ما زال موجودًا، ويُستخدم كخيار بديل لإرسال مكافأة عبر واتساب.

توثيقه في:

```text
docs/accounts-and-codes.md
docs/account-admin-grants.md
```

### الاختبارات التي نجحت

آخر فحوصات قبل آخر Commit:

```bash
pnpm typecheck
pnpm build
git diff --check
```

نجحت جميعها. يوجد تحذير Vite غير مانع بخصوص حجم ملف JavaScript الرئيسي، حوالي 663KB قبل الضغط.

---

## 3. الميزة الجاري تنفيذها: نقاط الإمبراطورية

طلب المستخدم إضافة تقييم موحّد للحساب باسم:

```text
نقاط الإمبراطورية
```

تمت كتابة بداية الحاسبة في `src/game/selectors.ts`، باسم:

```ts
selectEmpirePoints(profile)
```

وهي تعيد:

```ts
{
  total: number,
  title: string,
  wealth: number,
  performance: number,
  reputation: number,
  stability: number,
  expansion: number
}
```

النقاط من 0 إلى 1000، والعناوين الحالية:

```text
0–199    بداية الإمبراطورية
200–399  تاجر واعد
400–649  إمبراطورية صاعدة
650–849  إمبراطورية متقدمة
850–1000 إمبراطورية رائدة
```

مكونات الحساب الحالية:

- الثروة والأصول: حتى 300 نقطة.
- الأداء المالي والمبيعات والعقود: حتى 220 نقطة.
- السمعة: حتى 180 نقطة.
- الاستقرار والالتزامات والقروض المتعثرة: حتى 150 نقطة.
- التوسع في الأراضي والشركات والموظفين: حتى 150 نقطة.

### المطلوب إكماله في هذه الميزة فقط

1. تشغيل:
   ```bash
   pnpm typecheck
   pnpm build
   ```
2. استيراد `selectEmpirePoints` داخل `src/components/Dashboard.tsx`.
3. عرض بطاقة واضحة في لوحة البداية مثل:
   ```text
   نقاط الإمبراطورية
   742 / 1000
   إمبراطورية متقدمة
   ```
4. عرض تفاصيل مختصرة لمصادر النقاط، مثل الثروة والأداء والسمعة والاستقرار والتوسع.
5. إضافة سطر نقاط الإمبراطورية إلى إعدادات الحساب داخل `src/components/SectionPage.tsx`.
6. عدم إنشاء متصدرين أو جوائز تلقائية في هذه الدفعة؛ النقاط حاليًا تقييم موحّد محلي مشتق من بيانات الحساب.
7. بعد الاختبار، Commit وPush إلى `main`.

مهم: لا تحفظ `total` داخل LocalStorage كقيمة مستقلة قابلة للتعديل. يجب إعادة حسابه من `PlayerProfile` عند العرض. لاحقًا، عند إنشاء المتصدرين الحقيقيين، يجب إعادة حساب النقاط على الخادم أيضًا.

---

## 4. ما يحتاج إعدادًا خارجيًا

### Supabase

قبل اختبار لوحة الإدارة فعليًا:

1. افتح SQL Editor في مشروع Supabase.
2. نفّذ كامل الملف:
   ```text
   docs/supabase-schema.sql
   ```
3. تأكد من وجود:
   ```text
   game_profiles.account_code
   admin_grant_audit
   admin_grant_account(...)
   ```

### مفتاح الخادم

لوحة الإدارة تحتاج متغيرًا سريًا على الخادم:

```text
SUPABASE_SERVICE_ROLE_KEY
```

يمكن وضعه في بيئة الخادم أو ملف `.env` محلي غير مرفوع. يوجد مثال بدون قيمة سرية في:

```text
.env.example
```

لا تضع هذا المفتاح في:

- GitHub.
- `VITE_*`.
- كود React.
- APK.
- رسائل المحادثة.
- ملف التسليم.

### GitHub

البيئة السابقة كانت تحتوي على GitHub CLI مهيأً للمستودع. الحساب التالي يجب أن يتحقق بنفسه:

```bash
gh auth status
git remote -v
```

إذا لم يكن تسجيل الدخول متاحًا، يجب طلب صلاحية/تسجيل دخول جديد. لا توجد حاجة إلى نسخ Personal Access Token داخل هذا الملف، ولا يجوز كشفه أو حفظه نصيًا.

### هل توجد رموز سرية متاحة؟

لا توجد رموز سرية مكتوبة داخل هذا الملف. السبب أمني: مفاتيح GitHub وSupabase وملفات الجلسة لا يجوز تمريرها بين الحسابات كنص قابل للنسخ. يجب على الحساب التالي استخدام موصل GitHub المصرّح به أو طلب إدخال اعتماد جديد من المستخدم عند الحاجة.

---

## 5. متطلبات التشغيل

من جذر المشروع:

```bash
cd /home/ubuntu/Suly_besnes
pnpm install
pnpm typecheck
pnpm build
```

لتشغيل واجهة التطوير:

```bash
pnpm dev:hmr
```

لتشغيل نسخة Preview:

```bash
pnpm dev
```

ملاحظة مهمة: مسارات الإدارة مضافة عبر Vite middleware. يجب التحقق من بيئة النشر الفعلية؛ `configureServer` قد لا يكون كافيًا عند النشر كملفات ثابتة فقط. للإنتاج الحقيقي، انقل مسارات الإدارة إلى Edge Function أو Backend خادمي يحمي مفتاح `service_role`.

---

## 6. ما لا يجب تغييره أثناء الإكمال

- لا تضف بوابة دفع الآن؛ قرار المستخدم الحالي هو التحويل اليدوي والتواصل عبر واتساب.
- لا تضع مفتاح Supabase السري في المتصفح.
- لا تعتمد على `localStorage` كمصدر موثوق للمتصدرين الحقيقيين.
- لا تجعل اللاعب يرسل كلمة المرور عبر واتساب.
- لا تمنح الموارد مباشرة من React باستخدام Service Role Key.
- لا تحذف حقول الحفظ القديمة أو تغيّر `SAVE_VERSION` دون ترحيل واضح.
- لا تخلط نقاط الإمبراطورية الموحّدة مع `selectEmpirePulse` القديم؛ الأول تقييم حساب، والثاني نبض/تقدم محلي داخل اللعبة.

---

## 7. الأنظمة المستقبلية بعد نقاط الإمبراطورية

بعد إكمال الميزة الحالية واختبارها، الترتيب المقترح:

1. اختبار نقاط الإمبراطورية على ملفات حفظ مختلفة.
2. إضافة سجل نقاط زمني للحساب على الخادم.
3. إنشاء جدول تصنيف أسبوعي حقيقي.
4. حساب النقاط على الخادم لمنع التلاعب.
5. تثبيت نتيجة الأسبوع بتوقيت مصر.
6. منح جوائز المركز الأول والثاني والثالث مرة واحدة فقط.
7. إضافة شارات الفوز وسجل البطولات.
8. إضافة متجر الماس والبطاقات.
9. تحسين أداء التطبيق وتقسيم تحميل الأقسام.
10. اختبار APK والمزامنة دون اتصال.

لا تبدأ المتصدرين الحقيقيين قبل وجود مصدر نقاط خادمي وسجل تدقيق؛ وإلا يمكن تعديل النتائج من الحفظ المحلي.

---

## 8. بروتوكول التسليم للحساب التالي

```bash
cd /home/ubuntu/Suly_besnes
git status --short --branch
git pull --rebase origin main
pnpm typecheck
pnpm build
```

بعد إكمال نقاط الإمبراطورية:

```bash
git diff --check
git add src/game/selectors.ts src/components/Dashboard.tsx src/components/SectionPage.tsx
git commit -m "feat: add unified empire points rating"
git push origin main
git status --short --branch
```

يجب أن تكون النتيجة النهائية:

```text
## main...origin/main
```

مع عدم وجود ملفات معدلة غير مقصودة.
