# مراجع تصميم المتصدر العالمي

- https://supabase.com/docs/guides/database/postgres/row-level-security — Supabase Row Level Security. النقاط المستخدمة: تفعيل RLS لكل جدول مكشوف، ضبط grants بالإضافة إلى policies، فصل سياسات SELECT/INSERT/UPDATE/DELETE، واختبار السياسات عبر `supabase test db`.
- https://supabase.com/docs/guides/database/functions — Supabase Database Functions. النقاط المستخدمة: استخدام SECURITY DEFINER فقط عند الحاجة، تعيين `search_path = ''`، تسمية الجداول بالمخطط، التحقق من ملكية البيانات داخل الدالة، وتقييد صلاحية EXECUTE.
- https://supabase.com/docs/guides/functions/auth — Supabase Securing Edge Functions. النقاط المستخدمة: طلبات المستخدم عبر auth mode `user`، وعدم استخدام عميل service/admin إلا للعمليات المميزة وبعد تقييد هوية المستخدم.

في التطبيق، تقع وظيفة `supabase/functions/season-event/index.ts` بين المستخدم وRPC. تتحقق الوظيفة من JWT، وتسمح حاليًا بمكافأة `login_reward` اليومية فقط، ثم تستدعي RPC بمفتاح الخادم. تم إبقاء تسجيل أحداث اللعب الأخرى مقفلاً حتى تتوفر معاملات خادمية موثوقة يمكن التحقق منها.
