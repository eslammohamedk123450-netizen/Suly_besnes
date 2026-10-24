# إدارة إمبراطورية الأعمال

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.


## ملاحظات خاصة بهذا المشروع

هذا المجلد يحفظ نسخة مصدر لوحة الإدارة المنشورة على Manus WebDev: https://beadmin-b3zemmy4.manus.space. للتطوير المحلي استخدم `pnpm install --frozen-lockfile` ثم `pnpm check` و`pnpm test` و`pnpm build`؛ يشغَّل `pnpm dev` لخادم التطوير.

النسخة المنشورة تُدار من مشروع WebDev منفصل، لذلك لا يؤدي `git push` إلى هذا المستودع وحده إلى نشر تغييرات الموقع. حافظ على تزامن هذه النسخة مع مشروع WebDev واحفظ checkpoint فيه عند تعديل اللوحة.

ملفات `supabase/migrations/` و`supabase/functions/` تخص لوحة الإدارة ومشروع Supabase للعبة `kamxjsddjxowodatafqo`. هذه التغييرات طُبقت على المشروع الحي؛ لا تعِد تطبيقها عشوائيًا أو على مشروع آخر. لا تُودِع رمز إعداد المشرف الذي أُرسل على قناة خاصة، ولا مفتاح `service_role` أو مفتاح توقيع SULY1 الخاص. توليد الأكواد مقفول لحين استعادة مفتاح التوقيع القديم بأمان.
