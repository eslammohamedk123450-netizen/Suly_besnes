# نظام المدينة 2.5D Isometric

المشروع الحالي يعمل بـ **React + TypeScript + SVG/CSS** داخل `IsometricCityMap`، وليس Godot أو Unity. هذا الاختيار مناسب للعبة الهاتف الحالية لأنه يعطي خريطة خفيفة وسريعة مع مبانٍ لها عمق بصري وظلال، دون تحميل مشهد WebGL كامل.

## هرمية المكونات

```text
CityHomeView
└── IsometricCityMap
    ├── isometric-map-toolbar
    ├── isometric-map-viewport
    │   └── SVG isometric-map-canvas
    │       ├── ground diamond
    │       ├── iso-road-layer
    │       ├── iso-lot-layer
    │       ├── BuildingGlyph
    │       └── LandmarkGlyph
    └── isometric-map-footer

CityControlsBar
└── bottom mobile palette
    ├── Buildings
    ├── Roads
    ├── Nature
    └── Services
```

## الكاميرا اللمسية

داخل `src/components/isometric/IsometricCityMap.tsx`:

- `Pointer Events` تعمل بالماوس واللمس.
- سحب بإصبع واحد مع قصور حراري `velocityRef` وdamping مستقل عن FPS.
- `clampOffset()` يمنع الخريطة من الخروج عن حدود الـ viewport.
- Pinch-to-zoom محصور بين `0.72` و`1.65`.
- Tap منفصل عن drag حتى لا يفتح مبنى عند نهاية السحب.

## شبكة الطرق والمناطق

الخريطة تستخدم طرقًا قطرية قليلة وعريضة بدل شبكة مربعة مكتظة. يوجد محور رئيسي، طرق متقاطعة، مناطق خضراء، قطع أرض، ميناء ومطار. المسارات الأساسية مرسومة في `iso-road-layer`.

## المباني والعمق والظل

`BuildingGlyph` و`LandmarkGlyph` يستخدمان:

- إسقاطًا ثنائيًا: `project(x, z)` يحول إحداثيات العالم إلى diamond coordinates.
- pivot بصري عند أسفل المبنى عبر `point.y`.
- ظلًا بيضاويًا و`drop-shadow` أسفل كل مبنى.
- ترتيبًا بصريًا بواسطة ترتيب عناصر SVG وطبقة المباني بعد طبقة الأرض والطرق.

## Grid Snapping وPlacement

يوجد منطق قابل لإعادة الاستخدام في:

- `src/game/isometricPlacement.ts`
- `src/components/city3d/isometricGrid.ts`

الدوال المهمة:

- `worldToIsoCell()` و`isoCellToWorld()` للتحويل بين العالم وخلايا الـ diamond.
- `previewPlacement()` لتثبيت العنصر على أقرب خلية وفحص الخروج من الخريطة والتداخل.
- `commitPlacement()` لحجز الخلايا بعد تأكيد اللاعب.

تدفق اللعبة الحالي يفتح قطع الأراضي من خلال `CityControlsBar` ثم يكمل الشراء/البناء عبر `BuildingDetailSheet`، بدل السماح بوضع مبنى على طريق أو فوق مبنى قائم.

## لوحة الهاتف

`CityControlsBar` أصبحت ظاهرة أسفل شاشة المدينة وتحتوي على فئات المباني والطرق والطبيعة والخدمات. اختيار الفئة يركّز على منطقة الأراضي، ثم يختار اللاعب قطعة الأرض لفتح تدفق البناء الحالي.

## التحقق

```bash
npm run lint
npm run build
```
