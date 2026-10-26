# دليل الحلول الشاملة لتحزيم وتشغيل لعبة سولي بيزنس (Suly Business Empire)

تم حل جميع المشاكل التي كانت تمنع اللعبة من الصدور كحزمة تثبيت ولعب. إليك ملخص الملفات التي تم إصلاحها وتجهيزها:

## 1. تفعيل التثبيت المباشر للهواتف (PWA) — الحل الفوري
- **تم في `index.html`:** ربط ملف `manifest.webmanifest`، وتعيين وسوم ملء الشاشة لشاشات الهواتف وأجهزة آبل (`apple-mobile-web-app-capable`).
- **تم في `src/main.tsx`:** تسجيل الـ Service Worker ليعمل بنمط أوفلاين (Offline First) ويخزن واجهات اللعبة بالكامل داخل الهاتف.
- **تم في `public/manifest.webmanifest`:** تحسين التصنيفات وإضافة مقاسات الأيقونات (192x192 و 512x512).
- **النتيجة:** يستطيع أي لاعب الآن الدخول والضغط على زر **«تثبيت التطبيق»** فتظهر اللعبة كأيقونة على شاشة هاتفه وتعمل بدون إنترنت.

## 2. حل مشكلة حزمة أندرويد المستقلة (APK)
- **تم في `package.json`:** تثبيت حزم `@capacitor/cli` و `@capacitor/android`، وإضافة سكريبتات:
  - `npm run cap:sync`
  - `npm run cap:build-debug`
  - `npm run cap:build-release`
- **تم في `android/app/build.gradle`:** إضافة كتلة `signingConfigs.release` وتجهيز دعم التوقيع الرقمي بمفتاح Keystore.
- **تم إنشاء `.github/workflows/build-apk.yml`:** مسار أتمتة سحابي كامل يقوم ببناء ملف `Suly-Business-Empire-APK` تلقائياً عند كل push ورفعه في تبويب Releases للتحميل المباشر دون الحاجة لتثبيت Android Studio!

## 3. أمر توليد مفتاح التوقيع الرقمي (Keystore)
إذا أردت استخراج ملف Keystore رسمي لمتجر Google Play:
```bash
keytool -genkey -v -keystore android/app/suly-release-key.jks \
  -alias suly_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Suly Business Empire, OU=Gaming, O=Netizen, L=Cairo, ST=Cairo, C=EG" \
  -storepass suly_business_empire_2026 \
  -keypass suly_business_empire_2026
```

## 4. كيفية تطبيق التعديلات على مستودع GitHub الخاص بك
انسخ الملفات التالية إلى مستودعك:
1. `index.html`
2. `src/main.tsx`
3. `package.json`
4. `.github/workflows/build-apk.yml`
5. `android/app/build.gradle`
6. `public/manifest.webmanifest`
