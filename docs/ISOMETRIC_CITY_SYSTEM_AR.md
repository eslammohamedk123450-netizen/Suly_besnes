# نظام المدينة 2.5D Isometric

المشروع الحالي يستخدم **React + Three.js + Vite**، لذلك تم تنفيذ النظام داخل المشهد الحالي بدل إضافة مشروع Godot منفصل.

## شجرة المشهد الحالية

```text
CityHomeView
└── CityCanvas
    ├── Scene
    │   ├── Ground Plane
    │   ├── CityRoadNetwork
    │   │   ├── Main Avenue + Cross Boulevard
    │   │   ├── Ring Roads / T-junctions
    │   │   ├── Green zones, planters and trees
    │   │   └── Animated Traffic Vehicles
    │   ├── Landmark Groups
    │   │   ├── HQ / Bank / Tech Tree / Territory Citadel ...
    │   │   └── soft_drop_shadow per landmark
    │   ├── Plot Groups
    │   │   ├── construction stage or completed facility
    │   │   └── soft_drop_shadow per plot
    │   └── Camera-facing Arabic labels
    └── CityTouchController
```

## الكاميرا اللمسية

`src/components/city3d/cityTouchControls.ts` يحتوي على:

- سحب بإصبع واحد مع inertia وdecay مستقل عن معدل الإطارات.
- Clamp لمحورَي X/Z عبر `CITY_CAMERA_LIMITS`.
- Pinch-to-zoom عبر تغيير FOV مع حدود آمنة.
- Tap منفصل عن drag لإجراء raycast على المباني والأراضي.

## شبكة Isometric وPlacement

التحويلات موجودة في `src/components/city3d/isometricGrid.ts`:

- `worldToIsoCell(x, z)` يحول نقطة العالم إلى خلية diamond.
- `isoCellToWorld(cell)` يعيد مرساة الخلية للعالم.
- `snapWorldToIsoGrid()` يطبق Grid Snapping.
- `createSoftDropShadow()` ينشئ ظلًا بيضاويًا شفافًا أسفل أي مبنى.
- `updateIsometricDepthSorting()` يحدث ترتيب اللافتات الشفافة حسب العمق.

منطق التحقق من الوضع موجود في `src/game/isometricPlacement.ts`:

- `previewPlacement()` يعرض الخلية بعد snap.
- `canPlaceItem()` يمنع الخروج من حدود الخريطة والتداخل مع خلايا مشغولة.
- `commitPlacement()` يحجز خلايا العنصر بعد تأكيد الوضع.

## التدرج البصري للمباني

`src/components/city3d/cityMeshBuilders.ts`:

- `buildTechTreeMesh(..., level)` يضيف حلقات مدارية، ribs زجاجية، نواة أكبر وعددًا متزايدًا من وحدات البحث.
- `buildTerritoryCitadelMesh(..., level)` يضيف خندقًا، سورًا داخليًا، أبراجًا إضافية، قمة قيادة ومنارة.
- `CityCanvas` يمرر `profile.level` إلى كلا المجسمين.

## إضافة مبنى جديد

1. أضف دالة `build<Name>Mesh` في `cityMeshBuilders.ts`.
2. اجعل pivot المجسم عند `(0, 0, 0)` أسفل المبنى.
3. أضف `createSoftDropShadow(width, depth)` إلى المجموعة.
4. سجّل المبنى في `ALL_CITY_LANDMARKS`.
5. أضف حالة له في switch داخل `CityCanvas`.
6. سجّل العناصر القابلة للنقر عبر `registerClickable`.
7. إذا كان المبنى قابلًا للترقية، مرر المستوى إلى دالة البناء بدل إنشاء mesh ثابت.

## الاختبارات والتحقق

```bash
npm run lint
npm run build
```

يجب أن يظل تصميم الطرق هرميًا: محور رئيسي، بوليفارد متقاطع، طرق حلقية، مناطق خضراء وتقاطعات واضحة، وليس شبكة مربعة مكتظة.
